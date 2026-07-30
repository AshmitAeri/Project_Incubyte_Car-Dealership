import api from './api';

export const inventoryService = {
  /** Get full inventory history (admin only) */
  getInventoryHistory: (params = {}) => api.get('/inventory/history', { params }),

  /** Get current user's purchase history */
  getPurchaseHistory: (params = {}) => api.get('/inventory/purchases', { params }),
};
