import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiGetNotifications, apiMarkNotificationRead } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => () => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
  }, []);

  const fetchNotifications = async () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    try {
      const list = await apiGetNotifications(currentUser.id);
      setNotifications(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('[v0] Notifications failed to load:', error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    let active = true;
    setActiveChatBooking(null);
    fetchNotifications().catch(() => {
      if (active) setNotifications([]);
    });
    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  const showToast = (message, type = 'success') => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ message, type, id: Date.now() });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4500);
  };

  const markAsRead = async (notifId) => {
    await apiMarkNotificationRead(notifId);
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
  };

  const openChatForBooking = (booking) => {
    setActiveChatBooking(booking);
  };

  const closeChat = () => {
    setActiveChatBooking(null);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toast,
      activeChatBooking,
      showToast,
      markAsRead,
      openChatForBooking,
      closeChat,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
