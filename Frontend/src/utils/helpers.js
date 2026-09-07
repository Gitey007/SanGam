/**
 * Get initials from full name (e.g. "Sahul Kumar" -> "SK")
 */
export function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format college name or fallback
 */
export function formatCollege(college) {
  return college || 'College not specified';
}

/**
 * Format branch and year
 */
export function formatBranchYear(branch, year) {
  const parts = [];
  if (branch) parts.push(branch);
  if (year) parts.push(`Year ${year}`);
  return parts.join(' · ') || 'Student';
}

/**
 * Check whether an error is caused by a server cold-start, network drop, timeout,
 * or reverse-proxy gateway delay (502, 503, 504).
 */
export function isServerWakingUpError(error) {
  if (!error) return false;

  // Axios network error / timeout without a response from the server
  if (!error.response) {
    if (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT' ||
      error.message === 'Network Error' ||
      (typeof error.message === 'string' && (
        error.message.toLowerCase().includes('timeout') ||
        error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('failed to fetch')
      ))
    ) {
      return true;
    }
    // Any error without response object in Axios is unreachable / network / waking
    return true;
  }

  // Reverse proxy / hosting platform spin-up codes (Render free tier)
  const status = error.response.status;
  if (status === 502 || status === 503 || status === 504) {
    return true;
  }

  return false;
}

/**
 * Parse human readable error message from Axios / API response
 */
export function extractErrorMessage(error, defaultMessage = 'An unexpected error occurred.') {
  if (!error) return defaultMessage;
  
  if (typeof error === 'string') return error;

  // 1. Check for backend waking up / cold start / network unreachable
  if (isServerWakingUpError(error)) {
    return 'SanGam server is waking up. The backend is starting up (this can take 1–2 minutes after a period of inactivity on free hosting). Please wait a moment and try again.';
  }

  // 2. Specific HTTP response error handling
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Check if backend provided a specific error message in response body
    if (data) {
      if (typeof data === 'string' && data.trim()) return data;
      if (data.message && typeof data.message === 'string' && data.message.trim()) return data.message;
      if (data.error && typeof data.error === 'string' && data.error.trim()) return data.error;
    }

    // Default status code fallbacks if no specific message in data
    if (status === 400) {
      return 'Invalid request details. Please check your inputs and try again.';
    }
    if (status === 401) {
      return 'Your session has expired or authentication failed. Please sign in again.';
    }
    if (status === 403) {
      return "You don't have permission to perform this action.";
    }
    if (status === 404) {
      return 'The requested resource was not found.';
    }
    if (status === 409) {
      return 'A conflict occurred. The request could not be processed.';
    }
    if (status === 500) {
      return 'Server error. Please try again later.';
    }
  }

  return error.message || defaultMessage;
}


