import React, { createContext, useContext, useReducer, useEffect } from 'react';
import notificationService from '../services/notificationService';

// Notification types
export const NOTIFICATION_TYPES = {
  ORDER: 'order',
  DELIVERY: 'delivery',
  PROMOTION: 'promotion',
  SYSTEM: 'system'
};

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0
};

// Actions
const ACTIONS = {
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_ALL: 'CLEAR_ALL',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS'
};

// Reducer
function notificationReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_NOTIFICATION: {
      const newNotification = {
        id: Date.now() + Math.random(),
        ...action.payload,
        unread: true,
        timestamp: new Date(),
        time: new Date().toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    }

    case ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, unread: false }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          unread: false
        })),
        unreadCount: 0
      };

    case ACTIONS.REMOVE_NOTIFICATION: {
      const notificationToRemove = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notificationToRemove?.unread ? state.unreadCount - 1 : state.unreadCount
      };
    }

    case ACTIONS.CLEAR_ALL:
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };

    case ACTIONS.SET_NOTIFICATIONS: {
      const unreadCount = action.payload.filter(n => n.unread).length;
      return {
        ...state,
        notifications: action.payload,
        unreadCount
      };
    }

    default:
      return state;
  }
}

// Context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Initialize notifications from localStorage on mount
  useEffect(() => {
    const loadSavedNotifications = () => {
      try {
        const savedNotifications = localStorage.getItem('app_notifications');
        if (savedNotifications) {
          const parsed = JSON.parse(savedNotifications);
          console.log('📱 Loading saved notifications:', parsed.length);
          dispatch({ type: ACTIONS.SET_NOTIFICATIONS, payload: parsed });
        }
      } catch (error) {
        console.error('Error loading saved notifications:', error);
        // Clear corrupted data
        localStorage.removeItem('app_notifications');
      }
    };

    loadSavedNotifications();
  }, []);

  // Save notifications to localStorage whenever they change (with debouncing)
  useEffect(() => {
    const saveNotifications = () => {
      try {
        localStorage.setItem('app_notifications', JSON.stringify(state.notifications));
        console.log('💾 Saved notifications to localStorage:', state.notifications.length);
      } catch (error) {
        console.error('Error saving notifications:', error);
      }
    };

    // Debounce saves to avoid too frequent writes
    const timeoutId = setTimeout(saveNotifications, 500);
    return () => clearTimeout(timeoutId);
  }, [state.notifications]);

  // Set up real-time notification listeners
  useEffect(() => {
    // Override the showNotificationPopup method to also add to our notification list
    const originalShowPopup = notificationService.showNotificationPopup;
    
    notificationService.showNotificationPopup = (message, type) => {
      // Call original popup function
      originalShowPopup.call(notificationService, message, type);
      
      // Add to notification list
      addNotification({
        message,
        type: type === 'restaurant' ? NOTIFICATION_TYPES.ORDER : NOTIFICATION_TYPES.SYSTEM
      });
    };

    // Cleanup
    return () => {
      notificationService.showNotificationPopup = originalShowPopup;
    };
  }, []);

  // Actions
  const addNotification = (notificationData) => {
    dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: notificationData });
  };

  const markAsRead = (id) => {
    dispatch({ type: ACTIONS.MARK_AS_READ, payload: id });
  };

  const markAllAsRead = () => {
    dispatch({ type: ACTIONS.MARK_ALL_AS_READ });
  };

  const removeNotification = (id) => {
    dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
  };

  const clearAll = () => {
    dispatch({ type: ACTIONS.CLEAR_ALL });
  };

  const clearAllNotifications = () => {
    dispatch({ type: ACTIONS.CLEAR_ALL });
    localStorage.removeItem('app_notifications');
  };

  // Helper function to add different types of notifications
  const addOrderNotification = (orderData) => {
    addNotification({
      message: `📦 Nouvelle commande reçue (Commande #${orderData.orderId})`,
      type: NOTIFICATION_TYPES.ORDER,
      data: orderData
    });
  };

  const addDeliveryNotification = (deliveryData) => {
    addNotification({
      message: `🚚 Mise à jour de livraison: ${deliveryData.status}`,
      type: NOTIFICATION_TYPES.DELIVERY,
      data: deliveryData
    });
  };

  const addSystemNotification = (message) => {
    addNotification({
      message: `ℹ️ ${message}`,
      type: NOTIFICATION_TYPES.SYSTEM
    });
  };

  const value = {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    addNotification,
    addOrderNotification,
    addDeliveryNotification,
    addSystemNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
