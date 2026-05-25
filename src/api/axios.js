import axios from 'axios';

// In production (Vercel), use the environment variable
// In development, use the current hostname so mobile works too
const BASE = import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:5000/api`;

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fleetToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const token = localStorage.getItem('fleetToken');
      if (token) {
        localStorage.removeItem('fleetToken');
        localStorage.removeItem('fleetUser');
        setTimeout(() => { window.location.href = '/login'; }, 100);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
