/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { apiSendOtp, apiVerifyOtp, apiGetCurrentUser, apiLogout, getAuthToken, setAuthToken } from '../services/api';
import { HOMMIE_SEED_CUSTOMER } from '../data/hommieData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session from Neon on load
  const restoreSession = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (token) {
        const res = await apiGetCurrentUser();
        if (res.success && res.user) {
          setCurrentUser(res.user);
          return;
        }
      }
      // Fallback guest context
      setCurrentUser(HOMMIE_SEED_CUSTOMER);
    } catch (err) {
      console.warn('[HOMMIE Auth Session Restore Failed]:', err);
      setCurrentUser(HOMMIE_SEED_CUSTOMER);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await restoreSession();
    })();
  }, []);

  const sendOtp = async (phone) => {
    return await apiSendOtp(phone);
  };

  const verifyOtp = async (phone, otp, name) => {
    setIsLoading(true);
    try {
      const res = await apiVerifyOtp(phone, otp, name);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        return { success: true, user: res.user };
      }
      return { success: false, error: res.error || 'Invalid OTP' };
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phoneOrEmail, password, roleHint = 'customer') => {
    // For demo/quick login, sends OTP to backend and verifies with backend profile
    const phone = phoneOrEmail.replace(/[^0-9]/g, '').slice(-10) || (roleHint === 'admin' ? '9900011223' : roleHint === 'worker' ? '9876543210' : '9988776655');
    const otpRes = await apiSendOtp(phone);
    if (otpRes.success && otpRes.devOtp) {
      return await verifyOtp(phone, otpRes.devOtp);
    }
    return { success: false, error: 'Please verify with OTP' };
  };

  const register = async (userData) => {
    const phone = (userData.phone || '9988776655').replace(/[^0-9]/g, '').slice(-10);
    const otpRes = await apiSendOtp(phone);
    if (otpRes.success && otpRes.devOtp) {
      return await verifyOtp(phone, otpRes.devOtp, userData.fullName || userData.name);
    }
    return { success: false, error: 'OTP verification required' };
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setAuthToken(null);
      setCurrentUser(HOMMIE_SEED_CUSTOMER);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserSession = (updates) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      user: currentUser,
      isAuthenticated: Boolean(currentUser && currentUser.id),
      role: currentUser?.role || 'customer',
      isLoading,
      sendOtp,
      verifyOtp,
      login,
      register,
      logout,
      updateUserSession,
      refreshUser: restoreSession
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
