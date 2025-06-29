import baseApi from './baseApi';

class OrderService {
  // Get all orders and filter by restaurant
  async getRestaurantOrders(restaurantId) {
    try {
      // Use existing getAllOrders endpoint and filter client-side
      const response = await baseApi.get('/orders/getAll');
      console.log('API /orders/getAll response for restaurant filter:', response);
      console.log('API /orders/getAll response data:', response.data);
      
      // Ensure we have the orders array and preserve all nested data
      const allOrders = response.data?.orders || [];
      console.log('All orders before filtering:', allOrders);
      
      // Filter orders for the specific restaurant while preserving all nested data
      const restaurantOrders = allOrders.filter(order => {
        const matches = order.restaurant_id === parseInt(restaurantId);
        if (matches) {
          console.log('Matching order found:', order);
        }
        return matches;
      });
      
      console.log('Filtered restaurant orders:', restaurantOrders);
      
      return { 
        orders: restaurantOrders,
        total: restaurantOrders.length 
      };
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
      // First try the direct endpoint
      const response = await baseApi.get(`/orders/getOrder/${orderId}`);
      console.log('API /orders/getOrder response:', response);
      console.log('API /orders/getOrder response data:', response.data);
      
      // Ensure we return the complete order data with nested objects
      return response.data;
    } catch (error) {
      console.error('Error fetching order directly:', error);
      
      // If direct fetch fails, try getting all orders and filter
      try {
        console.log('Trying to fetch order from getAllOrders...');
        const allOrdersResponse = await baseApi.get('/orders/getAll');
        const allOrders = allOrdersResponse.data?.orders || [];
        const targetOrder = allOrders.find(order => order.id === parseInt(orderId));
        
        if (targetOrder) {
          console.log('Found order in getAllOrders with full data:', targetOrder);
          // Return the order with the same structure as the direct endpoint
          return { order: targetOrder };
        } else {
          throw new Error('Order not found in getAllOrders');
        }
      } catch (fallbackError) {
        console.error('Fallback getAllOrders also failed:', fallbackError);
        throw error; // throw original error
      }
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
    try {
      const response = await baseApi.get('/orders/getAll');
      console.log('getAllOrders API response:', response);
      console.log('getAllOrders API response data:', response.data);
      
      // Ensure we return the full data structure with nested objects
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();