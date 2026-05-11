import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAdminConfig = () => ({
  headers: {
    'x-admin-pin': sessionStorage.getItem('adminPin') || '',
  },
});

// Request interceptor for adding auth tokens (future use)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Menu API calls
export const menuAPI = {
  getMenu: () => api.get('/menu'),
  getCategories: () => api.get('/menu/categories'),
  getPopularItems: () => api.get('/menu/popular'),
  getMenuItem: (id) => api.get(`/menu/${id}`),
};

// Order API calls
export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrderStatus: (orderNumber) => api.get(`/orders/${orderNumber}`),
  updateOrderStatus: (orderNumber, status) => api.put(`/orders/${orderNumber}/status`, { status }),
};

// Admin API calls
export const adminAPI = {
  getActiveOrders: () => api.get('/admin/orders/active', getAdminConfig()),
  getOrders: () => api.get('/admin/orders', getAdminConfig()),
  updateOrderStatus: (orderNumber, status) => api.put(`/admin/orders/${orderNumber}/status`, { status }, getAdminConfig()),
};

// Contact API calls
export const contactAPI = {
  submitContact: (contactData) => api.post('/contact', contactData),
};

// Health check
export const healthAPI = {
  checkHealth: () => api.get('/health'),
};

export default api;
