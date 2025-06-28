import baseApi from './baseApi';

class OrderService {
  // Get all orders and filter by restaurant
  async getRestaurantOrders(restaurantId) {
    try {
      // Use existing getAllOrders endpoint and filter client-side
      const response = await baseApi.get('/orders/getAll');
      console.log('API /orders/getAll response:', response);
      
      // Filter orders for the specific restaurant
      const restaurantOrders = response.data?.orders?.filter(order => 
        order.restaurant_id === parseInt(restaurantId)
      ) || [];
      
      return { orders: restaurantOrders };
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      
      // If service is unavailable, return empty array with helpful message
      if (error.response?.status === 503 || error.code === 'ERR_BAD_RESPONSE') {
        console.warn('Order service is currently unavailable. Returning empty orders list.');
        return { 
          orders: [], 
          error: 'Le service de commandes est temporairement indisponible. Veuillez réessayer plus tard.' 
        };
      }
      
      throw error;
    }
  }

  // Get order by ID using existing endpoint
  async getById(orderId) {
    try {
      const response = await baseApi.get(`/orders/getOrder/${orderId}`);
      console.log('API /orders/getOrder response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Update order status using existing update endpoint
  async updateOrderStatus(orderId, status, deliveryUserId = null) {
    try {
      const requestBody = { status };
      if (deliveryUserId) {
        requestBody.deliveryUser_id = deliveryUserId;
      }
      
      const response = await baseApi.put(`/orders/update/${orderId}`, requestBody);
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Accept an order (change status to confirmed)
  async acceptOrder(orderId) {
    try {
      return await this.updateOrderStatus(orderId, 'confirmed');
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error;
    }
  }

  // Refuse an order (change status to cancelled)
  async refuseOrder(orderId) {
    try {
      return await this.updateOrderStatus(orderId, 'cancelled');
    } catch (error) {
      console.error('Error refusing order:', error);
      throw error;
    }
  }

  // Mark order as preparing
  async markOrderPreparing(orderId) {
    try {
      return await this.updateOrderStatus(orderId, 'preparing');
    } catch (error) {
      console.error('Error marking order as preparing:', error);
      throw error;
    }
  }

  // Mark order as ready for delivery
  async markOrderReady(orderId) {
    try {
      return await this.updateOrderStatus(orderId, 'delivering');
    } catch (error) {
      console.error('Error marking order as ready:', error);
      throw error;
    }
  }

  // Mark order as completed
  async markOrderCompleted(orderId) {
    try {
      return await this.updateOrderStatus(orderId, 'completed');
    } catch (error) {
      console.error('Error marking order as completed:', error);
      throw error;
    }
  }

  // Get all orders (calls /orders/getAll)
  async getAllOrders() {
    const response = await baseApi.get('/orders/getAll');
    return response.data;
  }
}

export const orderService = new OrderService();