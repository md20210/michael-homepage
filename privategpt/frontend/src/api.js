/**
 * API Client for Dabrock PrivateGPT Backend
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  requestMagicLink: (email) => api.post('/auth/request-magic-link', { email }),
  verifyMagicLink: (token) => api.get(`/auth/verify?token=${token}`),
  getMe: () => api.get('/auth/me'),
};

// Assistant API
export const assistantAPI = {
  getAll: () => api.get('/assistants'),
  create: () => api.post('/assistants'),
  getOne: (id) => api.get(`/assistants/${id}`),
};

// Document API
export const documentAPI = {
  getAll: (assistantId) => api.get(`/assistants/${assistantId}/documents`),
  upload: (assistantId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/assistants/${assistantId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Chat API
export const chatAPI = {
  getMessages: (assistantId) => api.get(`/assistants/${assistantId}/messages`),
  sendMessage: (assistantId, content) =>
    api.post(`/assistants/${assistantId}/chat`, { content }),
};

// User API
export const userAPI = {
  deleteMyData: () => api.delete('/users/me'),
};

export default api;
