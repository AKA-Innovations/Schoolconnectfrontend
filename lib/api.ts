import axios from 'axios';

function resolveApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const fallbackBaseUrl = 'http://127.0.0.1:3000';

  if (!configuredBaseUrl) {
    return fallbackBaseUrl;
  }

  try {
    const parsedUrl = new URL(configuredBaseUrl);

    if (parsedUrl.hostname === 'localhost') {
      parsedUrl.hostname = '127.0.0.1';
    }

    return parsedUrl.toString().replace(/\/$/, '');
  } catch {
    return configuredBaseUrl;
  }
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

import { useAuthStore } from '../store/authStore';

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Read directly from Zustand's in-memory state instead of parsing localStorage string every request.
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

import { toast } from 'sonner';

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;
      
      if (status === 401) {
        useAuthStore.getState().clearAuth();
        document.cookie = 'auth-token=; Max-Age=0; path=/';
        document.cookie = 'user-role=; Max-Age=0; path=/';
        document.cookie = 'is-principal=; Max-Age=0; path=/';
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      } else if (status === 403) {
        toast.error('Access Denied: You do not have permission to access this resource.');
      } else if (status === 500) {
        toast.error('Internal Server Error: Please try again later.');
      } else if (!error.response) {
        toast.error('Network Connection Error: Please check your network connectivity.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
