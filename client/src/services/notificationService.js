import { io } from "socket.io-client";

class NotificationService {
  constructor() {
    this.socket = io("http://localhost:3008");
    this.isConnected = false;
    this.currentUser = null;
    this.setupSocketListeners();
    
    // Initialize on startup
    this.initialize();
  }

  initialize() {
    // Try to re-register user if they were logged in before page refresh
    setTimeout(() => {
      if (!this.currentUser) {
        this.tryReRegisterFromStorage();
      }
    }, 1000); // Give socket time to connect
  }

  setupSocketListeners() {
    this.socket.on('connect', () => {
      console.log('🔌 Connected to notification service:', this.socket.id);
      this.isConnected = true;
      
      // Re-register user if they were previously registered
      if (this.currentUser) {
        console.log('🔄 Re-registering user after reconnection:', this.currentUser);
        this.registerUser(this.currentUser);
      } else {
        // Try to get user from localStorage and re-register
        this.tryReRegisterFromStorage();
      }
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from notification service');
      this.isConnected = false;
    });

    this.socket.on('restaurant-notification', (data) => {
      console.log('🏪 Restaurant notification received:', data);
      this.showNotificationPopup(data.message, 'restaurant');
    });

    this.socket.on('user-notification', (data) => {
      console.log('👤 User notification received:', data);
      this.showNotificationPopup(data.message, 'user');
    });
  }

  tryReRegisterFromStorage() {
    try {
      // First try to get user from localStorage
      const storedUser = localStorage.getItem('notificationUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('🔄 Found stored user, re-registering:', user);
        this.registerUser(user);
        return;
      }

      // Fallback: try to get user info from access token
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        console.log('🔄 Found access token, attempting to get user info');
        this.getCurrentUserAndRegister();
      }
    } catch (error) {
      console.log('⚠️ Could not re-register user from storage:', error);
    }
  }

  async getCurrentUserAndRegister() {
    try {
      // Make API call to get current user
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          console.log('✅ Retrieved user from API, re-registering:', data.user);
          this.registerUser(data.user);
        }
      }
    } catch (error) {
      console.log('⚠️ Could not get current user for re-registration:', error);
    }
  }

  registerUser(user) {
    this.currentUser = user;
    
    // Store user info in localStorage for persistence across page refreshes
    localStorage.setItem('notificationUser', JSON.stringify(user));
    
    if (!this.isConnected) {
      console.log('🔌 Socket not connected, will register when connected');
      return;
    }

    if (user.role === 'restaurant') {
      console.log('🏪 Registering restaurant with socket:', user.id);
      this.socket.emit("register", { restaurant_id: user.id });
    } else if (user.role === 'customer' || user.role === 'client') {
      console.log('👥 Registering customer with socket:', user.id);
      this.socket.emit("register", { user_id: user.id });
    } else {
      console.log('❓ Unknown user role:', user.role);
    }
  }

  showNotificationPopup(message, type) {
    // Create notification popup
    const popup = document.createElement('div');
    popup.className = `notification-popup notification-${type}`;
    popup.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">
          ${type === 'restaurant' ? '🏪' : '👤'}
        </div>
        <div class="notification-message">${message}</div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Add styles
    popup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'restaurant' ? '#4CAF50' : '#2196F3'};
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      min-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;

    // Add animation styles to head if not already added
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .notification-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .notification-icon {
          font-size: 24px;
        }
        
        .notification-message {
          flex: 1;
          font-weight: 500;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s;
        }
        
        .notification-close:hover {
          background: rgba(255,255,255,0.2);
        }
      `;
      document.head.appendChild(style);
    }

    // Add to DOM
    document.body.appendChild(popup);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (popup.parentElement) {
        popup.remove();
      }
    }, 5000);

    // Play notification sound (optional)
    this.playNotificationSound();
  }

  playNotificationSound() {
    // Create a simple notification sound
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }

  disconnect() {
    this.currentUser = null;
    localStorage.removeItem('notificationUser');
    this.socket.disconnect();
  }

  // Debug function - call from browser console
  debugConnection() {
    console.log('🔍 Debug Info:');
    console.log('- Socket connected:', this.isConnected);
    console.log('- Socket ID:', this.socket.id);
    console.log('- Current user:', this.currentUser);
    
    // Test connection to notification service
    fetch('http://localhost:3008/debug/clients')
      .then(res => res.json())
      .then(data => {
        console.log('- Server connected clients:', data);
      })
      .catch(err => {
        console.error('- Failed to fetch debug info:', err);
      });
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Make it globally available for debugging
window.notificationService = notificationService;

export default notificationService;
