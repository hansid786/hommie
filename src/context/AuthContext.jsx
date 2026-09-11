import React, { createContext, useContext, useState, useEffect } from 'react';
import { HOMMIE_SEED_CUSTOMER } from '../data/hommieData';
import { apiLogin, apiRegister } from '../services/api';
import { isSupabaseConfigured, supabase } from '../services/supabase';

const AUTH_STORAGE_KEY = 'hommie_auth_user_v1';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
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
    supabase.auth.getUser().then(({ data }) => {
      if (active && data.user) {
        const metadata = data.user.user_metadata || {};
        setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          name: metadata.fullName || metadata.name || data.user.email?.split('@')[0],
          role: metadata.role === 'professional' ? 'worker' : (metadata.role || 'customer'),
          phone: metadata.phone || '',
          avatar: metadata.avatar || ''
        });
      }
      if (active) setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session?.user) {
        setCurrentUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }
      const metadata = session.user.user_metadata || {};
      const nextUser = {
        id: session.user.id,
        email: session.user.email,
        name: metadata.fullName || metadata.name || session.user.email?.split('@')[0],
        role: metadata.role === 'professional' ? 'worker' : (metadata.role || 'customer'),
        phone: metadata.phone || '',
        avatar: metadata.avatar || ''
      };
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
        const { data, error } = await supabase.auth.signInWithPassword({ email: phoneOrEmail, password });
        if (error) throw new Error('Invalid email or password');
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
