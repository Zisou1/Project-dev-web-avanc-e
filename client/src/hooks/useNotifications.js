import { useState, useCallback } from 'react';

export const useNotifications = (initialNotifications = []) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(), // Simple ID generation
      unread: true,
      time: 'À l\'instant',
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, unread: false }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    setNotifications
  };
};
