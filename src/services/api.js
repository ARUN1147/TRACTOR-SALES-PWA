import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Sales API
export const salesAPI = {
  createNormalSale: (saleData) => api.post('/sales/normal', saleData),
  createExchangeSale: (saleData) => api.post('/sales/exchange', saleData),
  getAllSales: (params) => api.get('/sales', { params }),
  getSaleById: (id) => api.get(`/sales/${id}`),
};

// Vehicles API
export const vehiclesAPI = {
  getNewVehicles: () => api.get('/vehicles/new'),
  addNewVehicle: (vehicleData) => api.post('/vehicles/new', vehicleData),
  updateNewVehicle: (id, vehicleData) => api.put(`/vehicles/new/${id}`, vehicleData),
  deleteNewVehicle: (id) => api.delete(`/vehicles/new/${id}`),
  getUsedVehicles: () => api.get('/vehicles/used'),
};

// Dashboard API
export const dashboardAPI = {
  getAnalytics: (params) => api.get('/dashboard/analytics', { params }),
  getPaymentAlerts: () => api.get('/dashboard/payment-alerts'),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
};

export default api;