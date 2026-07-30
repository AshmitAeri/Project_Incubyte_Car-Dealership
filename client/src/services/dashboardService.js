import api from './api';

export const dashboardService = {
  /** Get full dashboard data (stats + charts) */
  getDashboard: () => api.get('/dashboard'),
};
