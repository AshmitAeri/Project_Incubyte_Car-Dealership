import api from './api';

export const testDriveService = {
  book: (data) => api.post('/testdrives', data),
  getMine: () => api.get('/testdrives/mine'),
  cancel: (id) => api.delete(`/testdrives/${id}`),
  // Admin
  getAll: () => api.get('/testdrives'),
  updateStatus: (id, status) => api.put(`/testdrives/${id}`, { status }),
};
