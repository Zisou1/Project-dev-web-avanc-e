import api from './baseApi';

export const orderService = {
  // Get orders by restaurant ID
  async getOrdersByRestaurant(restaurantId) {
    const response = await api.get(`/orders/getOrderByRestaurant/${restaurantId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Get all orders
  async getAllOrders() {
    const response = await api.get('/orders/getAll', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Get order by ID
  async getOrderById(id) {
    const response = await api.get(`/orders/getOrder/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Update order
  async updateOrder(id, orderData) {
    const response = await api.put(`/orders/update/${id}`, orderData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Create order
  async createOrder(orderData) {
    const response = await api.post('/orders/create', orderData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  }
};
