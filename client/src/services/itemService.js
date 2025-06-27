import api from './baseApi';

export const itemService = {
  // Helper function to get user from JWT token
  getUserFromToken() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      // Check if token is not expired
      if (tokenPayload.exp * 1000 > Date.now()) {
        return {
          id: tokenPayload.id,
          email: tokenPayload.email,
          name: tokenPayload.name,
          role: tokenPayload.role
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  },

  // Helper function to get restaurant ID by user ID
  async getRestaurantIdByUserId(userId) {
    try {
      console.log('🔍 Looking for restaurant with user_id:', userId);
      const response = await api.get('/restaurants/getAll', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('📊 All restaurants:', response.data.restaurants);
      
      // Find restaurant where user_id matches the logged-in user
      const restaurant = response.data.restaurants?.find(r => r.user_id === userId);
      console.log('🎯 Found restaurant:', restaurant);
      
      if (restaurant?.id) {
        console.log('✅ Restaurant ID found:', restaurant.id);
        return restaurant.id;
      } else {
        console.log('❌ No restaurant found for user_id:', userId);
        return null;
      }
    } catch (error) {
      console.error('Error fetching restaurant by user ID:', error);
      return null;
    }
  },
  // Get all items
  async getAll() {
    const response = await api.get('/restaurants/item/getAll', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Create new item
  async create(itemData) {
    // Attach restaurant_id from restaurant data based on user from JWT token
    let data = itemData;
    if (!(itemData instanceof FormData)) {
      data = new FormData();
      Object.entries(itemData).forEach(([key, value]) => data.append(key, value));
    }
    try {
      const user = this.getUserFromToken();
      console.log('👤 Current user from JWT token:', user);
      
      if (user?.id) {
        // Get the restaurant ID for this user
        const restaurantId = await this.getRestaurantIdByUserId(user.id);
        console.log('🏪 Restaurant ID retrieved:', restaurantId);
        
        if (restaurantId) {
          data.append('restaurant_id', restaurantId);
          console.log('✅ Added restaurant_id to FormData:', restaurantId);
        } else {
          console.error('❌ No restaurant ID found for user:', user.id);
          throw new Error('Restaurant not found for this user');
        }
      } else {
        console.error('❌ No user found in JWT token');
        throw new Error('User not authenticated');
      }
    } catch (e) {
      console.error('Error getting restaurant data:', e);
      throw e; // Re-throw the error so it's visible to the calling code
    }
    const response = await api.post('/restaurants/item/create', data, {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Update item
  async update(id, itemData) {
    let data = itemData;
    if (!(itemData instanceof FormData)) {
      data = new FormData();
      Object.entries(itemData).forEach(([key, value]) => data.append(key, value));
    }
    try {
      const user = this.getUserFromToken();
      if (user?.id) {
        // Get the restaurant ID for this user
        const restaurantId = await this.getRestaurantIdByUserId(user.id);
        if (restaurantId) {
          data.append('restaurant_id', restaurantId);
        }
      }
    } catch (e) {
      console.error('Error getting restaurant data:', e);
    }
    const response = await api.put(`/restaurants/item/update/${id}`, data, {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Delete item
  async delete(id) {
    const response = await api.delete(`/restaurants/item/delete/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },
};
