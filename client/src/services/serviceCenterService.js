import api from './api';

export const serviceCenterService = {
  getByBrand: (brand) => api.get(`/servicecenters?brand=${encodeURIComponent(brand)}`),
};
