import api from './baseApi';

export const restaurantService = {
  // Get restaurant by user ID
  async getRestaurantByUserId(userId) {
    const response = await api.get('/restaurants/getAll', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Find restaurant where user_id matches the logged-in user
    const restaurant = response.data.restaurants?.find(r => r.user_id === userId);
    return restaurant;
  },

  // Get all restaurants
  async getAll() {
    const response = await api.get('/restaurants/getAll', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Get restaurant by ID
  async getById(id) {
    const response = await api.get(`/restaurants/getRestaurent/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  }
};
