import api from './baseApi';

export const itemService = {
  // Get all items
  async getAll() {
    const response = await api.get('/restaurants/item/getAll', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Create new item
  async create(itemData) {
    // Attach restaurant_id from user in localStorage if available
    let data = itemData;
    if (!(itemData instanceof FormData)) {
      data = new FormData();
      Object.entries(itemData).forEach(([key, value]) => data.append(key, value));
    }
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.id) {
        data.append('restaurant_id', user.id);
      }
    } catch (e) {}
    const response = await api.post('/restaurants/item/creat', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Update item
  async update(id, itemData) {
    let data = itemData;
    if (!(itemData instanceof FormData)) {
      data = new FormData();
      Object.entries(itemData).forEach(([key, value]) => data.append(key, value));
    }
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.id) {
        data.append('restaurant_id', user.id);
      }
    } catch (e) {}
    const response = await api.put(`/restaurants/item/update/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Delete item
  async delete(id) {
    const response = await api.delete(`/restaurants/item/delete/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },
};
