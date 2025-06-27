import api from './baseApi';

export const menuService = {
  async getAll() {
    const response = await api.get('/restaurants/menu/getAll');
    return response.data;
  },
  async create(menuData) {
    let data = menuData;
    if (!(menuData instanceof FormData)) {
      data = new FormData();
      Object.entries(menuData).forEach(([key, value]) => data.append(key, value));
    }
    const response = await api.post('/restaurants/menu/creat', data, {
      headers: { 'Accept': 'application/json' },
    });
    return response.data;
  },
  async update(id, menuData) {
    let data = menuData;
    if (!(menuData instanceof FormData)) {
      data = new FormData();
      Object.entries(menuData).forEach(([key, value]) => data.append(key, value));
    }
    const response = await api.put(`/restaurants/menu/update/${id}`, data, {
      headers: { 'Accept': 'application/json' },
    });
    return response.data;
  },
  async delete(id) {
    const response = await api.delete(`/restaurants/menu/delete/${id}`);
    return response.data;
  },
  async getById(id) {
    const response = await api.get(`/restaurants/menu/getMenu/${id}`);
    return response.data;
  },
  async addItems(menuId, itemId) {
    const response = await api.post(`/restaurants/menuItem/add`, {
      menu_id: menuId,
      item_id: itemId,
    });
    return response.data;
  },
  async getMenuItems(menuId) {
    const response = await api.get(`/restaurants/menuItem/getItemMenu/${menuId}`);
    return response.data;
  },
  async removeItem(menuId, itemId) {
    // Use RESTful route: /restaurants/menuItem/delete/:menu_id/:item_id
    const response = await api.delete(`/restaurants/menuItem/delete/${menuId}/${itemId}`);
    return response.data;
  },
};
