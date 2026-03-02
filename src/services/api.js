import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://hrms-backend-1-1gbp.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.errors ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject({ message, status: error.response?.status, data: error.response?.data });
  }
);

export const employeeAPI = {
  list: (params = {}) => api.get('/employees/', { params }),
  get: (id) => api.get(`/employees/${id}/`),
  create: (data) => api.post('/employees/', data),
  delete: (id) => api.delete(`/employees/${id}/`),
  getAttendance: (id, params = {}) => api.get(`/employees/${id}/attendance/`, { params }),
};

export const attendanceAPI = {
  list: (params = {}) => api.get('/attendance/', { params }),
  get: (id) => api.get(`/attendance/${id}/`),
  create: (data) => api.post('/attendance/', data),
  update: (id, data) => api.put(`/attendance/${id}/`, data),
  delete: (id) => api.delete(`/attendance/${id}/`),
};

export const dashboardAPI = {
  summary: () => api.get('/dashboard/'),
};

export default api;
