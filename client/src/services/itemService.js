import api from './baseApi';

export const itemService = {
  // Get all items
  async getAll() {
    const response = await api.get('/item/getAll', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Create new item
  async create(itemData) {
    const response = await api.post('/item/create', itemData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Update item
  async update(id, itemData) {
    const response = await api.put(`/item/update/${id}`, itemData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },

  // Delete item
  async delete(id) {
    const response = await api.delete(`/item/delete/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    return response.data;
  },
};
