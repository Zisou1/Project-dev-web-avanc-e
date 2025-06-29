import api from './baseApi';

export const menuService = {
  // Get all menus for a restaurant
  async getRestaurantMenus(restaurantId) {
    const response = await api.get(`/restaurants/menu/getRestaurentMenu/${restaurantId}`);
    return response.data;
  },

  // Get menu by ID
  async getById(id) {
    const response = await api.get(`/restaurants/menu/getMenu/${id}`);
    return response.data;
  },

  // Create a new menu
  async create(menuData) {
    const response = await api.post('/restaurants/menu/create', menuData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update menu
  async update(id, menuData) {
    const response = await api.put(`/restaurants/menu/update/${id}`, menuData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete menu
  async delete(id) {
    const response = await api.delete(`/restaurants/menu/delete/${id}`);
    return response.data;
  },

  // Menu Item Management
  menuItems: {
    // Get items in a menu
    async getMenuItems(menuId) {
      const response = await api.get(`/restaurants/menuItem/getItemMenu/${menuId}`);
      return response.data;
    },

    // Add item to menu
    async addItem(menuId, itemId) {
      const response = await api.post('/restaurants/menuItem/add', {
        menu_id: menuId,
        item_id: itemId
      });
      return response.data;
    },

    // Remove item from menu
    async removeItem(menuId, itemId) {
      const response = await api.delete(`/restaurants/menuItem/delete/${menuId}/${itemId}`);
      return response.data;
    },

    // Update item in menu
    async updateItem(id, menuId, itemId) {
      const response = await api.put(`/restaurants/menuItem/update/${id}`, {
        menu_id: menuId,
        item_id: itemId
      });
      return response.data;
    }
  }
};
