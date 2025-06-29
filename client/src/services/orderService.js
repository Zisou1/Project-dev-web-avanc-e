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
    console.log('📋 OrderService: === START getById ===');
    console.log('📋 OrderService: Fetching order with ID:', orderId);
    console.log('📋 OrderService: Current timestamp:', new Date().toISOString());
    
    try {
      console.log('📋 OrderService: Attempting direct API call to /orders/getOrder/', orderId);
      // First try the direct endpoint
      const response = await baseApi.get(`/orders/getOrder/${orderId}`);
      console.log('✅ OrderService: Direct API call successful');
      console.log('✅ OrderService: Response status:', response.status);
      console.log('✅ OrderService: Response data:', response.data);
      console.log('✅ OrderService: Response data structure:', {
        hasOrder: !!response.data?.order,
        orderId: response.data?.order?.id,
        orderStatus: response.data?.order?.status,
        dataKeys: response.data ? Object.keys(response.data) : 'null'
      });
      console.log('📋 OrderService: === END getById SUCCESS ===');
      return response.data;
    } catch (error) {
      console.error('❌ OrderService: Direct API call failed:', error);
      console.error('❌ OrderService: Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      
      // If direct fetch fails, try getting all orders and filter
      try {
        console.log('🔄 OrderService: Trying fallback - fetching from getAllOrders...');
        const allOrdersResponse = await baseApi.get('/orders/getAll');
        console.log('🔄 OrderService: getAllOrders response:', allOrdersResponse.data);
        
        const allOrders = allOrdersResponse.data?.orders || [];
        console.log('🔄 OrderService: Total orders found:', allOrders.length);
        console.log('🔄 OrderService: Looking for order with ID:', parseInt(orderId));
        
        const targetOrder = allOrders.find(order => order.id === parseInt(orderId));
        
        if (targetOrder) {
          console.log('✅ OrderService: Found order in getAllOrders:', targetOrder);
          console.log('📋 OrderService: === END getById FALLBACK SUCCESS ===');
          return { order: targetOrder };
        } else {
          console.log('❌ OrderService: Order not found in getAllOrders');
          console.log('❌ OrderService: Available order IDs:', allOrders.map(o => o.id));
          throw new Error('Order not found in getAllOrders');
        }
      } catch (fallbackError) {
        console.error('❌ OrderService: Fallback getAllOrders also failed:', fallbackError);
        console.log('📋 OrderService: === END getById COMPLETE FAILURE ===');
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
    const response = await baseApi.get('/orders/getAll');
    console.log('22222222222222222222222222222222222222222222222222', response);
    return response.data;
  }
}

export const orderService = new OrderService();