import api from './baseApi';

export const deliveryService = {
  // Get delivery assigned to a specific user (delivery agent)
  async getDeliveryByUser(userId) {
    try {
      const response = await api.get(`/delivery/getDeliveryByUser/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery by user:', error);
      throw error;
    }
  },

  // Get all deliveries
  async getAllDeliveries() {
    try {
      const response = await api.get('/delivery/getAll', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all deliveries:', error);
      throw error;
    }
  },

  // Get delivery by ID
  async getDeliveryById(deliveryId) {
    try {
      const response = await api.get(`/delivery/getDelivery/${deliveryId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery by ID:', error);
      throw error;
    }
  },

  // Update delivery status
  async updateDelivery(deliveryId, updateData) {
    try {
      const response = await api.put(`/delivery/update/${deliveryId}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating delivery:', error);
      throw error;
    }
  }
};