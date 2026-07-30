import api from './api';

export const preBookingService = {
  create: (carId) => api.post(`/prebookings/${carId}`),
  cancel: (carId) => api.delete(`/prebookings/${carId}`),
  getMine: () => api.get('/prebookings/mine'),
  check: (carId) => api.get(`/prebookings/check/${carId}`),
};
