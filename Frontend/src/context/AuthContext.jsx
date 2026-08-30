import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/constants';
import { setupApiInterceptors } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY) || null;
  });

  const [loading, setLoading] = useState(true);
  const { error: toastError } = useToast();

  const logout = useCallback((reason) => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
    if (reason) {
      toastError(reason);
    }
  }, [toastError]);

  const login = useCallback((jwtToken, userData) => {
    if (!jwtToken) {
      console.error('Login called without JWT token');
      return;
    }
    localStorage.setItem(AUTH_TOKEN_KEY, jwtToken);
    setToken(jwtToken);

    if (userData) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Configure API interceptors to link 401 & 403 with AuthContext
  useEffect(() => {
    setupApiInterceptors({
      onUnauthorized: () => {
        logout('Your session has expired. Please sign in again.');
      },
      onForbidden: () => {
        toastError("You do not have permission to access this resource.");
      },
    });
    setLoading(false);
  }, [logout, toastError]);

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        updateUser,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
