import api from './api';

export const carService = {
  /** Get cars with optional query params (search, filter, sort, page) */
  getCars: (params = {}) => api.get('/cars', { params }),

  /** Get a single car by ID */
  getCarById: (id) => api.get(`/cars/${id}`),

  /** Create a new car (Admin, multipart/form-data) */
  createCar: (formData) =>
    api.post('/cars', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** Update a car (Admin, multipart/form-data) */
  updateCar: (id, formData) =>
    api.put(`/cars/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** Delete a car (Admin) */
  deleteCar: (id) => api.delete(`/cars/${id}`),

  /** Purchase a car */
  purchaseCar: (id, quantity = 1, paymentData = {}) => api.post(`/cars/${id}/purchase`, { quantity, ...paymentData }),

  /** Restock a car (Admin) */
  restockCar: (id, quantity, notes = '') =>
    api.post(`/cars/${id}/restock`, { quantity, notes }),
};
