import api from './api';

export const authService = {
  /** Register a new user */
  register: (data) => api.post('/auth/register', data),

  /** Login */
  login: (data) => api.post('/auth/login', data),

  /** Logout */
  logout: () => api.post('/auth/logout'),

  /** Get current user profile */
  getMe: () => api.get('/auth/me'),

  /** Update profile (with avatar upload) */
  updateProfile: (formData) =>
    api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /** Toggle car wishlist */
  toggleWishlist: (carId) => api.post(`/auth/wishlist/${carId}`),
};
