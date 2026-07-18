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
  timeout: 30000, // 30 seconds request timeout
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
  
  // If the request data is FormData, let browser/axios handle boundary setting
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type'];
    }
  }
  
  return config;
});

import { toast } from 'sonner';

let lastToastTime = 0;
const TOAST_THROTTLE_MS = 3000;

function showThrottledError(message: string) {
  const now = Date.now();
  if (now - lastToastTime > TOAST_THROTTLE_MS) {
    toast.error(message);
    lastToastTime = now;
  }
}

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
        showThrottledError('Access Denied: You do not have permission to access this resource.');
      } else if (status === 500) {
        showThrottledError('Internal Server Error: Please try again later.');
      } else if (!error.response) {
        showThrottledError('Network Connection Error: Please check your network connectivity.');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
