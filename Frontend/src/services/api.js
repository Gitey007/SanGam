import axios from 'axios';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants';
import { isServerWakingUpError } from '../utils/helpers';
import healthApi from './healthApi';

// Retry configuration for cold starts
const RETRY_DELAYS = [10000, 15000, 20000]; // 10s, 15s, 20s
const MAX_RETRIES = 3;

// Create base Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Event bus listeners for global 401 / 403 / server waking handling
let onUnauthorizedCallback = null;
let onForbiddenCallback = null;
let onServerWakingCallback = null;

export const setupApiInterceptors = ({ onUnauthorized, onForbidden, onServerWaking }) => {
  onUnauthorizedCallback = onUnauthorized;
  onForbiddenCallback = onForbidden;
  onServerWakingCallback = onServerWaking;
};

/**
 * Helper to wait with early-wake detection via health check
 */
async function waitWithHealthCheck(delayMs) {
  const checkInterval = 3000;
  let elapsed = 0;

  while (elapsed < delayMs) {
    const sleepDuration = Math.min(checkInterval, delayMs - elapsed);
    await new Promise((resolve) => setTimeout(resolve, sleepDuration));
    elapsed += sleepDuration;

    // After waiting at least 3 seconds, do a quick health check ping
    if (elapsed >= 3000) {
      const isAwake = await healthApi.checkHealth(2500);
      if (isAwake) {
        // Backend has recovered early!
        break;
      }
    }
  }
}

// Request interceptor: Attach JWT token if present for authenticated endpoints
api.interceptors.request.use(
  (config) => {
    const isPublicAuth = config.url && (
      config.url.startsWith('/api/auth/login') ||
      config.url.startsWith('/api/auth/register') ||
      config.url.startsWith('/api/auth/email/')
    );

    if (!isPublicAuth) {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        config.headers.Authorization = `Bearer ${token.trim()}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Global error handling and safe cold-start auto-retry
api.interceptors.response.use(
  (response) => {
    if (onServerWakingCallback) {
      onServerWakingCallback(false);
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // 1. Safe Auto-Retry for Idempotent GET Requests on Backend Cold-Start
    const method = config?.method ? config.method.toLowerCase() : 'get';
    const isGetRequest = method === 'get';
    // Only auto-retry GET requests or requests explicitly configured with retryable: true
    const isRetryable = config && (config.retryable === true || (isGetRequest && config.retryable !== false));

    if (config && isRetryable && isServerWakingUpError(error)) {
      config.__retryCount = config.__retryCount || 0;

      if (config.__retryCount < MAX_RETRIES) {
        const delayMs = RETRY_DELAYS[config.__retryCount] || 20000;
        config.__retryCount += 1;

        if (onServerWakingCallback) {
          onServerWakingCallback({
            isWaking: true,
            retryCount: config.__retryCount,
            maxRetries: MAX_RETRIES,
            delayMs,
          });
        }

        // Wait with health check before next retry attempt
        await waitWithHealthCheck(delayMs);

        // Retry request through axios instance
        return api(config);
      }
    }

    // If retries exhausted or non-retryable, notify waking state listener
    if (onServerWakingCallback && isServerWakingUpError(error)) {
      onServerWakingCallback({
        isWaking: true,
        exhausted: true,
      });
    }

    // 2. Global Auth & Permission error handling
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

