import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
  verifyOtp: (email, otp) => api.post('/api/auth/verify-otp', { email, otp }),
  resendOtp: (email) => api.post('/api/auth/resend-otp', { email }),
};

// Jobs API
export const jobAPI = {
  getJobs: (params) => api.get('/api/jobs', { params }),
  getMyJobs: () => api.get('/api/jobs/my'),
  postJob: (data) => api.post('/api/jobs', data),
  deleteJob: (id) => api.delete(`/api/jobs/${id}`),
  acceptJob: (id) => api.post(`/api/jobs/${id}/accept`),
  completeJob: (id) => api.post(`/api/jobs/${id}/complete`),
  reviewJob: (id, rating) => api.post(`/api/jobs/${id}/review`, { rating }),
  toggleFavorite: (id) => api.post(`/api/jobs/${id}/favorite`),
  getFavorites: () => api.get('/api/jobs/favorites'),
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/api/profile'),
  updateProfile: (data) => api.put('/api/profile', data),
  getPublicProfile: (userId) => api.get(`/api/profile/${userId}`),
  deleteAccount: () => api.delete('/api/profile'),
};

// Reports API
export const reportAPI = {
  submitReport: (targetType, targetId, reason) =>
    api.post('/api/reports', { targetType, targetId, reason }),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  getUser: (id) => api.get(`/api/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  banUser: (id) => api.patch(`/api/admin/users/${id}/ban`),
  deleteUser: (id) => api.delete(`/api/god/users/${id}`),
  getJobs: (params) => api.get('/api/admin/jobs', { params }),
  getJob: (id) => api.get(`/api/admin/jobs/${id}`),
  updateJob: (id, data) => api.put(`/api/admin/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/api/admin/jobs/${id}`),
  getReports: (params) => api.get('/api/admin/reports', { params }),
  deleteReview: (id) => api.delete(`/api/admin/reviews/${id}`),
  impersonateUser: (id) => api.post(`/api/god/impersonate/${id}`),
  changeRole: (id, role) => api.put(`/api/god/users/${id}/role`, { role }),
};

// Chat API
export const chatAPI = {
  getConversations: () => api.get('/api/chat/conversations'),
  startConversation: (recipientId, jobId) => api.post('/api/chat/start', { recipientId, jobId }),
  getConversationMessages: (conversationId) => api.get(`/api/chat/${conversationId}/messages`),
  sendConversationMessage: (conversationId, content, attachment = null) =>
    api.post(`/api/chat/${conversationId}/messages`, { content, attachment }),

  // Legacy
  getMessages: (jobId) => api.get(`/api/chat/${jobId}`),
  sendMessage: (jobId, content) => api.post(`/api/chat/${jobId}`, { content }),
  getDirectMessages: (userId) => api.get(`/api/chat/direct/${userId}`),
  sendDirectMessage: (userId, content) => api.post(`/api/chat/direct/${userId}`, { content }),
  getDMs: () => api.get('/api/chat/dms'),
  uploadAttachment: (formData) => api.post('/api/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;
