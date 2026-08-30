import axios from 'axios';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants';

// Create base Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Event bus listeners for global 401 / 403 handling
let onUnauthorizedCallback = null;
let onForbiddenCallback = null;

export const setupApiInterceptors = ({ onUnauthorized, onForbidden }) => {
  onUnauthorizedCallback = onUnauthorized;
  onForbiddenCallback = onForbidden;
};

// Request interceptor: Attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Global error handling (401, 403)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Session expired or invalid token
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback(error);
        }
      } else if (status === 403) {
        // Forbidden: notify user, but DO NOT automatically log out
        if (onForbiddenCallback) {
          onForbiddenCallback(error);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
