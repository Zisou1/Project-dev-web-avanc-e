import api from './baseApi';

export const adminService = {
  // Dashboard Statistics
  async getDashboardStats() {
    try {
      const response = await api.get('/auth/user/getAll');
      const users = response.data.user || [];
      
      // Get additional data
      const [restaurantsRes, ordersRes] = await Promise.all([
        api.get('/restaurants/getAll').catch(() => ({ data: { restaurants: [] } })),
        api.get('/orders/getAll').catch(() => ({ data: { orders: [] } }))
      ]);

      const restaurants = restaurantsRes.data.restaurants || [];
      const orders = ordersRes.data.orders || [];

      // Calculate statistics
      const totalUsers = users.length;
      const customers = users.filter(user => user.role === 'customer').length;
      const restaurateurs = users.filter(user => user.role === 'restaurant').length;
      const livreurs = users.filter(user => user.role === 'delivery' || user.role === 'livreur').length;
      const totalRestaurants = restaurants.length;
      const totalOrders = orders.length;
      
      // Calculate today's orders
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt || order.created_at).toISOString().split('T')[0];
        return orderDate === today;
      }).length;

      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.total_price || order.totalPrice || order.total || 0);
      }, 0);

      // Calculate active users (users who placed orders in last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const activeUsers = orders.filter(order => {
        const orderDate = new Date(order.createdAt || order.created_at);
        return orderDate >= weekAgo;
      }).map(order => order.user_id).filter((id, index, arr) => arr.indexOf(id) === index).length;

      return {
        totalUsers,
        customers,
        restaurateurs,
        livreurs,
        totalRestaurants,
        totalOrders,
        todayOrders,
        totalRevenue,
        activeUsers
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Users Management
  async getAllUsers() {
    try {
      const response = await api.get('/auth/user/getAll');
      return response.data.user || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async getUserById(id) {
    try {
      const response = await api.get(`/auth/user/getUser/${id}`);
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async updateUser(id, userData) {
    try {
      const response = await api.put(`/auth/user/update/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      const response = await api.delete(`/auth/user/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async suspendUser(id) {
    try {
      const response = await api.put(`/auth/user/update/${id}`, { isActive: false });
      return response.data;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  },

  async activateUser(id) {
    try {
      const response = await api.put(`/auth/user/update/${id}`, { isActive: true });
      return response.data;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  },

  // Restaurants Management
  async getAllRestaurants() {
    try {
      const response = await api.get('/restaurants/getAll');
      return response.data.restaurants || [];
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  },

  async getRestaurantById(id) {
    try {
      const response = await api.get(`/restaurants/getRestaurent/${id}`);
      return response.data.restaurant;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      throw error;
    }
  },

  async updateRestaurant(id, restaurantData) {
    try {
      const response = await api.put(`/restaurants/update/${id}`, restaurantData);
      return response.data;
    } catch (error) {
      console.error('Error updating restaurant:', error);
      throw error;
    }
  },

  async deleteRestaurant(id) {
    try {
      const response = await api.delete(`/restaurants/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      throw error;
    }
  },

  // Orders Management
  async getAllOrders() {
    try {
      const response = await api.get('/orders/getAll');
      return response.data.orders || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  async getOrderById(id) {
    try {
      const response = await api.get(`/orders/getOrder/${id}`);
      return response.data.order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  async updateOrderStatus(id, status) {
    try {
      const response = await api.put(`/orders/update/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Analytics and KPIs
  async getAnalytics(timeRange = 30) {
    try {
      const [usersRes, restaurantsRes, ordersRes] = await Promise.all([
        api.get('/auth/user/getAll').catch(() => ({ data: { user: [] } })),
        api.get('/restaurants/getAll').catch(() => ({ data: { restaurants: [] } })),
        api.get('/orders/getAll').catch(() => ({ data: { orders: [] } }))
      ]);

      const users = usersRes.data.user || [];
      const restaurants = restaurantsRes.data.restaurants || [];
      const orders = ordersRes.data.orders || [];

      // Filter data by time range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeRange);

      const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt || order.created_at);
        return orderDate >= cutoffDate;
      });

      const filteredUsers = users.filter(user => {
        const userDate = new Date(user.createdAt || user.created_at);
        return userDate >= cutoffDate;
      });

      // Daily statistics
      const dailyStats = this.calculateDailyStats(filteredOrders, timeRange);
      
      // User growth
      const userGrowth = this.calculateUserGrowth(filteredUsers, timeRange);
      
      // Revenue analytics
      const revenueAnalytics = this.calculateRevenueAnalytics(filteredOrders);

      // Popular restaurants
      const popularRestaurants = this.getPopularRestaurants(filteredOrders, restaurants);

      return {
        totalUsers: users.length,
        totalRestaurants: restaurants.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.total_price || 0), 0),
        dailyStats,
        userGrowth,
        revenueAnalytics,
        popularRestaurants,
        timeRange
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  // Helper methods for analytics
  calculateDailyStats(orders, days) {
    const stats = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt || order.created_at).toISOString().split('T')[0];
        return orderDate === dateStr;
      });

      stats.push({
        date: dateStr,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + (order.total_price || 0), 0)
      });
    }
    
    return stats;
  },

  calculateUserGrowth(users, days) {
    const growth = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayUsers = users.filter(user => {
        const userDate = new Date(user.createdAt || user.created_at).toISOString().split('T')[0];
        return userDate === dateStr;
      });

      growth.push({
        date: dateStr,
        newUsers: dayUsers.length,
        customers: dayUsers.filter(u => u.role === 'customer').length,
        restaurants: dayUsers.filter(u => u.role === 'restaurant').length,
        deliveries: dayUsers.filter(u => u.role === 'delivery' || u.role === 'livreur').length
      });
    }
    
    return growth;
  },

  calculateRevenueAnalytics(orders) {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    const statusDistribution = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRevenue,
      avgOrderValue,
      statusDistribution,
      completedOrders: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length
    };
  },

  getPopularRestaurants(orders, restaurants) {
    const restaurantStats = {};
    
    orders.forEach(order => {
      const restaurantId = order.restaurant_id;
      if (!restaurantStats[restaurantId]) {
        restaurantStats[restaurantId] = {
          orders: 0,
          revenue: 0
        };
      }
      restaurantStats[restaurantId].orders += 1;
      restaurantStats[restaurantId].revenue += (order.total_price || 0);
    });

    return Object.entries(restaurantStats)
      .map(([restaurantId, stats]) => {
        const restaurant = restaurants.find(r => r.id === parseInt(restaurantId));
        return {
          id: restaurantId,
          name: restaurant?.name || 'Restaurant inconnu',
          orders: stats.orders,
          revenue: stats.revenue,
          avgOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0
        };
      })
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);
  }
};
