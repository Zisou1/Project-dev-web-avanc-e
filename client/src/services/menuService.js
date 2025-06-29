import api from './baseApi';

const menuService = {
  // Get all menus
  async getAll() {
    const response = await api.get('/restaurants/menu/getAll', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Get menu by ID
  async getById(id) {
    const response = await api.get(`/restaurants/menu/getMenu/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Get menus for a specific restaurant
  async getRestaurantMenus(restaurantId) {
    const response = await api.get(`/restaurants/menu/getRestaurentMenu/${restaurantId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Get items for a specific menu
  async getMenuItems(menuId) {
    const response = await api.get(`/restaurants/menuItem/getItemMenu/${menuId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Create new menu
  async create(menuData) {
    let data = menuData;
    if (!(menuData instanceof FormData)) {
      data = new FormData();
      Object.entries(menuData).forEach(([key, value]) => data.append(key, value));
    }
    
    const response = await api.post('/restaurants/menu/create', data, {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Update menu
  async update(id, menuData) {
    let data = menuData;
    if (!(menuData instanceof FormData)) {
      data = new FormData();
      Object.entries(menuData).forEach(([key, value]) => data.append(key, value));
    }
    
    const response = await api.put(`/restaurants/menu/update/${id}`, data, {
      headers: {
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Delete menu
  async delete(id) {
    const response = await api.delete(`/restaurants/menu/delete/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  }
};

export default menuService;
