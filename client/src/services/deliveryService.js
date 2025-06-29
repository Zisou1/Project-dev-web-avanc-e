import api from './baseApi';

export const deliveryService = {
  // Get delivery assigned to a specific user (delivery agent)
  async getDeliveryByUser(userId) {
    console.log('🚚 DeliveryService: === START getDeliveryByUser ===');
    console.log('🚚 DeliveryService: Fetching delivery for user:', userId);
    console.log('🚚 DeliveryService: Current timestamp:', new Date().toISOString());
    
    try {
      console.log('🚚 DeliveryService: Making API call to:', `/delivery/getDeliveryByUser/${userId}`);
      console.log('🚚 DeliveryService: API base URL:', api.defaults.baseURL);
      
      const response = await api.get(`/delivery/getDeliveryByUser/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 8000, // 8 second timeout
      });
      
      console.log('🚚 DeliveryService: === API RESPONSE SUCCESS ===');
      console.log('🚚 DeliveryService: API Response Status:', response.status);
      console.log('🚚 DeliveryService: API Response Headers:', response.headers);
      console.log('🚚 DeliveryService: API Response Data:', response.data);
      console.log('🚚 DeliveryService: Response data type:', typeof response.data);
      console.log('🚚 DeliveryService: Response data keys:', response.data ? Object.keys(response.data) : 'null');
      
      // Return the actual data, handle different response structures
      if (response.data && typeof response.data === 'object') {
        const result = response.data.delivery || response.data;
        console.log('🚚 DeliveryService: Returning processed result:', result);
        console.log('🚚 DeliveryService: === END getDeliveryByUser SUCCESS ===');
        return result;
      }
      
      console.log('🚚 DeliveryService: Returning raw response data:', response.data);
      console.log('🚚 DeliveryService: === END getDeliveryByUser SUCCESS ===');
      return response.data;
    } catch (error) {
      console.log('🚚 DeliveryService: === API RESPONSE ERROR ===');
      console.error('🚚 DeliveryService: Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
      
      // Don't throw error if it's a 404 (no delivery found), return null instead
      if (error.response?.status === 404) {
        console.log('🚚 DeliveryService: No delivery found for user (404), returning null');
        console.log('🚚 DeliveryService: === END getDeliveryByUser 404 ===');
        return null;
      }
      
      console.log('🚚 DeliveryService: === END getDeliveryByUser ERROR ===');
      throw error;
    }
  },

  // Get all deliveries
  async getAllDeliveries() {
    console.log('🚚 DeliveryService: Fetching all deliveries');
    try {
      const response = await api.get('/delivery/getAll', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 8000,
      });
      console.log('🚚 DeliveryService: All deliveries fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('🚚 DeliveryService: Error fetching all deliveries:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Get delivery by ID
  async getDeliveryById(deliveryId) {
    console.log('🚚 DeliveryService: Fetching delivery by ID:', deliveryId);
    try {
      const response = await api.get(`/delivery/getDelivery/${deliveryId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 8000,
      });
      console.log('🚚 DeliveryService: Delivery by ID fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('🚚 DeliveryService: Error fetching delivery by ID:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Update delivery status
  async updateDelivery(deliveryId, updateData) {
    console.log('🚚 DeliveryService: Updating delivery:', deliveryId, updateData);
    try {
      const response = await api.put(`/delivery/update/${deliveryId}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 8000,
      });
      console.log('🚚 DeliveryService: Delivery updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('🚚 DeliveryService: Error updating delivery:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },

  // Test connectivity to delivery service
  async testConnection() {
    console.log('🚚 DeliveryService: Testing connection...');
    try {
      const response = await api.get('/delivery/test', {
        timeout: 5000,
      });
      console.log('🚚 DeliveryService: Connection test successful:', response.data);
      return true;
    } catch (error) {
      console.error('🚚 DeliveryService: Connection test failed:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return false;
    }
  }
};
