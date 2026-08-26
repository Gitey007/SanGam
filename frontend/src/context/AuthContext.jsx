import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import { getCurrentUserProfile } from '../api/users';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sangam_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sangam_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('sangam_token');
      if (storedToken) {
        try {
          const profile = await getCurrentUserProfile();
          setUser(profile);
          localStorage.setItem('sangam_user', JSON.stringify(profile));
        } catch (error) {
          console.error('Failed to restore session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = async (credentials) => {
    const data = await apiLogin(credentials);
    const { token: jwtToken, ...userData } = data;
    localStorage.setItem('sangam_token', jwtToken);
    localStorage.setItem('sangam_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const registerUser = async (userData) => {
    const data = await apiRegister(userData);
    const { token: jwtToken, ...userInfo } = data;
    localStorage.setItem('sangam_token', jwtToken);
    localStorage.setItem('sangam_user', JSON.stringify(userInfo));
    setToken(jwtToken);
    setUser(userInfo);
    return userInfo;
  };

  const logout = () => {
    localStorage.removeItem('sangam_token');
    localStorage.removeItem('sangam_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await getCurrentUserProfile();
      setUser(profile);
      localStorage.setItem('sangam_user', JSON.stringify(profile));
      return profile;
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login: loginUser,
        register: registerUser,
        logout,
        refreshUser,
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
