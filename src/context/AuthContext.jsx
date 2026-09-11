import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin, apiRegister } from '../services/api';
import { isSupabaseConfigured, supabase } from '../services/supabase';

const AUTH_STORAGE_KEY = 'hommie_auth_user_v1';
const AuthContext = createContext(null);

const normalizeIdentifier = (value = '') => value.trim();

const getUserFromSupabase = (authUser) => {
  const metadata = authUser.user_metadata || {};
  const appMetadata = authUser.app_metadata || {};
  const role = appMetadata.role || metadata.role || 'customer';
  return {
    id: authUser.id,
    email: authUser.email,
    name: metadata.fullName || metadata.name || authUser.email?.split('@')[0] || 'Hommie user',
    role: role === 'professional' ? 'worker' : role,
    phone: metadata.phone || authUser.phone || '',
    avatar: metadata.avatar || ''
  };
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    if (isSupabaseConfigured) return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return undefined;
    }

    let active = true;
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (active && data.user) {
          setCurrentUser(getUserFromSupabase(data.user));
        } else if (active) {
          setCurrentUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (error) {
        console.error('[v0] Auth initialization failed:', error);
        if (active) {
          setCurrentUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session?.user) {
        setCurrentUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setIsLoading(false);
        return;
      }
      const nextUser = getUserFromSupabase(session.user);
      setCurrentUser(nextUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (phoneOrEmail, password, roleHint = 'customer') => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const identifier = normalizeIdentifier(phoneOrEmail);
        const normalizedPassword = password.trim();
        const credentials = identifier.includes('@')
          ? { email: identifier.toLowerCase(), password: normalizedPassword }
          : { phone: identifier.replace(/[\s()-]/g, ''), password: normalizedPassword };
        const { data, error } = await supabase.auth.signInWithPassword(credentials);
        if (error) {
          const message = error.message?.toLowerCase() || '';
          if (message.includes('email not confirmed')) {
            throw new Error('Please confirm your email before signing in.');
          }
          if (message.includes('rate limit')) {
            throw new Error('Too many attempts. Please wait a moment and try again.');
          }
          throw new Error('Invalid email/phone or password.');
        }
        const metadata = data.user.user_metadata || {};
        const appMetadata = data.user.app_metadata || {};
        const user = {
          id: data.user.id,
          email: data.user.email,
          name: metadata.fullName || metadata.name || data.user.email?.split('@')[0],
          phone: metadata.phone || '',
          role: appMetadata.role === 'professional' ? 'worker' : (appMetadata.role || metadata.role || 'customer')
        };
        setCurrentUser(user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        return { success: true, user };
      }
      const result = await apiLogin(phoneOrEmail, password, roleHint === 'professional' ? 'worker' : roleHint);
      const user = { ...result.user, role: result.user.role === 'professional' ? 'worker' : result.user.role };
      setCurrentUser(user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return { success: true, user };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            emailRedirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
            data: {
              fullName: userData.fullName,
              phone: userData.phone,
              role: userData.role === 'professional' ? 'worker' : userData.role,
              trade: userData.trade
            }
          }
        });
        if (error) throw error;
        const user = {
          id: data.user?.id,
          email: data.user?.email,
          name: userData.fullName,
          phone: userData.phone,
          role: userData.role === 'professional' ? 'worker' : userData.role
        };
        if (data.session) {
          setCurrentUser(user);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        }
        return { success: true, user, requiresEmailConfirmation: !data.session };
      }
      const result = await apiRegister({ ...userData, role: userData.role === 'professional' ? 'worker' : userData.role });
      const user = { ...result.user, role: result.user.role === 'professional' ? 'worker' : result.user.role };
      setCurrentUser(user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      return { success: true, user };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: Boolean(currentUser),
      role: currentUser?.role || 'customer',
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
