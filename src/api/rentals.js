import api from './axios.js';
export const getRentals    = (params) => api.get('/rentals', { params });
export const getRental     = (id)     => api.get(`/rentals/${id}`);
export const createRental  = (data)   => api.post('/rentals', data);
export const pickupVehicle = (id)     => api.patch(`/rentals/${id}/pickup`);
export const returnVehicle = (id, data) => api.patch(`/rentals/${id}/return`, data);
export const cancelRental  = (id, data) => api.patch(`/rentals/${id}/cancel`, data);
