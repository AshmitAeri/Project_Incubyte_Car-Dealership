import api from './api';

export const reviewService = {
  getByCarId: (carId) => api.get(`/cars/${carId}/reviews`),
  checkCanReview: (carId) => api.get(`/cars/${carId}/reviews/canreview`),
  create: (carId, data) => api.post(`/cars/${carId}/reviews`, data),
  delete: (carId, reviewId) => api.delete(`/cars/${carId}/reviews/${reviewId}`),
};
