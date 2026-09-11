import React, { createContext, useContext, useState, useEffect } from 'react';
import { HOMMIE_SEED_CUSTOMER, HOMMIE_PROFESSIONALS } from '../data/hommieData';
import { apiLogin, apiRegister } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hommie_auth_user_v1');
      if (!saved) return null;
      const user = JSON.parse(saved);
      const role = user.role === 'professional' ? 'worker' : user.role;
      return { ...user, role };
    } catch (e) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const login = async (phoneOrEmail, password, roleHint = 'customer') => {
    setIsLoading(true);
    try {
      const result = await apiLogin(phoneOrEmail, password, roleHint === 'professional' ? 'worker' : roleHint);
      const user = { ...result.user, role: result.user.role === 'professional' ? 'worker' : result.user.role };
      setCurrentUser(user);
      localStorage.setItem('hommie_auth_user_v1', JSON.stringify(user));
      return { success: true, user };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const result = await apiRegister({ ...userData, role: userData.role === 'professional' ? 'worker' : userData.role });
      const user = { ...result.user, role: result.user.role === 'professional' ? 'worker' : result.user.role };
      setCurrentUser(user);
      localStorage.setItem('hommie_auth_user_v1', JSON.stringify(user));
      return { success: true, user };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hommie_auth_user_v1');
  };

  const switchRole = (newRole) => {
    if (newRole === 'professional' || newRole === 'worker') {
      const pro = HOMMIE_PROFESSIONALS[0];
      const proUser = {
        id: pro.userId,
        proId: pro.id,
        name: pro.name,
        phone: pro.phone,
        email: pro.email,
        role: 'worker',
        trade: pro.trade,
        avatar: pro.avatar,
        kycStatus: pro.kycStatus,
        isAvailable: pro.isAvailable
      };
      setCurrentUser(proUser);
      localStorage.setItem('hommie_auth_user_v1', JSON.stringify(proUser));
    } else if (newRole === 'admin') {
      const adminUser = {
        id: 'u-admin-1',
        name: 'HOMMIE Operations Lead',
        phone: '+91 99000 11223',
        email: 'ops@hommie.in',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      };
      setCurrentUser(adminUser);
      localStorage.setItem('hommie_auth_user_v1', JSON.stringify(adminUser));
    } else {
      const custUser = { ...HOMMIE_SEED_CUSTOMER, role: 'customer' };
      setCurrentUser(custUser);
      localStorage.setItem('hommie_auth_user_v1', JSON.stringify(custUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: Boolean(currentUser),
      role: currentUser?.role || 'customer',
      isLoading,
      login,
      register,
      logout,
      switchRole
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
