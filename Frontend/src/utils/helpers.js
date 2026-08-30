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
 * Parse human readable error message from Axios / API response
 */
export function extractErrorMessage(error, defaultMessage = 'An unexpected error occurred.') {
  if (!error) return defaultMessage;
  
  if (typeof error === 'string') return error;

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

  if (error.message === 'Network Error' || !error.response) {
    return 'Unable to connect to SanGam server. Please check your network connection or ensure the backend is running.';
  }

  return error.message || defaultMessage;
}

