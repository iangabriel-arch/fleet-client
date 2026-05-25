import api from './axios.js';
export const getDashboardSummary  = () => api.get('/analytics');
export const getRevenueAnalytics  = (params) => api.get('/analytics/revenue', { params });
export const getVehicleUtilization = () => api.get('/analytics/utilization');
