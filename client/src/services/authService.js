import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { io } from "socket.io-client";
const socket = io("http://localhost:3008");

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  // Don't set default Content-Type, let each request set its own
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Set default Content-Type only if not already set and not FormData
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Use direct axios call to avoid circular dependency
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
          });
          localStorage.setItem('accessToken', response.data.tokens.accessToken);
          localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.data.tokens.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  // Register new user
  async register(userData) {
    try {
      // Check if we need to send as FormData (when image is present)
      let requestData = userData;
      
      if (userData.image) {
        // Create FormData for file upload
        const formData = new FormData();
        Object.keys(userData).forEach(key => {
          if (key === 'image') {
            formData.append('image', userData[key]);
          } else {
            formData.append(key, userData[key]);
          }
        });
        requestData = formData;
      }
      
      const response = await api.post('/auth/register', requestData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Login user
  async login(email, password) {
    // eslint-disable-next-line no-useless-catch
    try {
    const response = await api.post('/auth/login', { email, password });

    const user = response.data.user; // ✅ get logged-in user from response

    // 👉 Register socket for notifications;
    if (user.role === 'restaurant') {
      socket.emit("register", { restaurant_id: user.id });
      console.log('Registering restaurant with socket:', user.id);
      
    } else if ( user.role === 'register') {
      socket.emit("register", { user_id: user.id });
    } else{
      console.log('user not conected');
      
    } 

    return response.data;
  } catch (error) {
    throw error;
  }
  },

  // Logout user
  async logout(refreshToken) {
    try {
      const response = await api.post('/auth/logout', { refreshToken });
      const user = response.data.user; // You must extract this from the response

      // 👉 Register the socket after login
      if (user.role === "restaurant") {
        socket.emit("register", { restaurant_id: user.id });
      } else {
        socket.emit("register", { user_id: user.id });
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      // Use direct axios call to avoid interceptor recursion
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset password
  async resetPassword(token, password) {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verify token
  async verifyToken(token) {
    try {
      const response = await api.post('/auth/verify-token', { token });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};