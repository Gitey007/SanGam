/**
 * In-memory client-side cache and in-flight promise deduplicator
 * for idempotent GET requests.
 */

// Default TTL for cached GET requests (in milliseconds)
const DEFAULT_TTL_MS = 25000; // 25 seconds

// Endpoints that should NEVER be cached or deduplicated
const NO_CACHE_PREFIXES = [
  '/api/health',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/email',
  '/api/auth/forgot-password',
];

class ApiCache {
  constructor() {
    this.cache = new Map(); // key -> { data, expiresAt }
    this.inFlight = new Map(); // key -> Promise
  }

  /**
   * Generate a unique cache key based on URL and query params
   */
  generateKey(url, params = {}) {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }
    const sortedParams = Object.keys(params)
      .sort()
      .filter((k) => params[k] !== undefined && params[k] !== null && params[k] !== '')
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');

    return sortedParams ? `${url}?${sortedParams}` : url;
  }

  /**
   * Check if a given URL should bypass cache
   */
  isNoCacheUrl(url) {
    if (!url) return true;
    return NO_CACHE_PREFIXES.some((prefix) => url.startsWith(prefix));
  }

  /**
   * Get cached data if valid
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Store data in cache
   */
  set(key, data, ttlMs = DEFAULT_TTL_MS) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Check if an identical request is currently in-flight
   */
  getInFlight(key) {
    return this.inFlight.get(key) || null;
  }

  /**
   * Register an in-flight request promise
   */
  setInFlight(key, promise) {
    this.inFlight.set(key, promise);
    promise
      .finally(() => {
        this.inFlight.delete(key);
      })
      .catch(() => {});
  }

  /**
   * Invalidate cached entries matching a prefix or regex pattern
   */
  invalidate(pattern) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (typeof pattern === 'string' && key.includes(pattern)) {
        this.cache.delete(key);
      } else if (pattern instanceof RegExp && pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Automatically invalidate relevant cached data on mutations
   */
  invalidateOnMutation(method, url) {
    const upperMethod = method ? method.toUpperCase() : '';
    if (upperMethod === 'GET' || upperMethod === 'HEAD' || upperMethod === 'OPTIONS') {
      return;
    }

    if (!url) {
      this.cache.clear();
      return;
    }

    if (url.includes('/api/teams')) {
      // Invalidate all team lists and details
      this.invalidate('/api/teams');
    } else if (url.includes('/api/users')) {
      // Invalidate all user lists and user profiles
      this.invalidate('/api/users');
    } else if (url.includes('/api/skills')) {
      // Invalidate skills and users
      this.invalidate('/api/skills');
      this.invalidate('/api/users');
    } else {
      this.cache.clear();
    }
  }

  /**
   * Clear all cached data
   */
  clear() {
    this.cache.clear();
    this.inFlight.clear();
  }
}

export const apiCache = new ApiCache();
export default apiCache;
