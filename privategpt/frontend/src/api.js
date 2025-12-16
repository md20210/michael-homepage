/**
 * API Client for Dabrock PrivateGPT Backend
 */
import axios from 'axios';
import i18n from './i18n';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token and language to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add Accept-Language header based on current i18n language
  const currentLanguage = i18n.language || 'de';
  config.headers['Accept-Language'] = currentLanguage;

  return config;
});

// Auth API
export const authAPI = {
  requestMagicLink: (email) => api.post('/auth/request-magic-link', { email }),
  verifyMagicLink: (token) => api.get(`/auth/verify?token=${token}`),
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password) => api.post('/auth/register', { email, password }),
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
  delete: (assistantId, documentId) => api.delete(`/assistants/${assistantId}/documents/${documentId}`),
};

// Chat API
export const chatAPI = {
  getMessages: (assistantId) => api.get(`/assistants/${assistantId}/messages`),
  sendMessage: (assistantId, content) =>
    api.post(`/assistants/${assistantId}/chat`, { content }),
  deleteMessages: (assistantId) => api.delete(`/assistants/${assistantId}/messages`),
};

// User API
export const userAPI = {
  deleteMyData: () => api.delete('/users/me'),
};

// Admin API (nur für Superadmin)
export const adminAPI = {
  isAdmin: () => api.get('/admin/is-admin'),
  getModels: () => api.get('/admin/llm/models'),
  getCurrentModel: () => api.get('/admin/llm/current'),
  setModel: (modelId) => api.post('/admin/llm/set', { model_id: modelId }),
};

export default api;
