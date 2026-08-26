import api from './axios';

export const getAllUsers = async () => {
  const response = await api.get('/api/users');
  return response.data;
};

export const getCurrentUserProfile = async () => {
  const response = await api.get('/api/users/me');
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await api.get(`/api/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userId, data) => {
  const response = await api.put(`/api/users/${userId}`, data);
  return response.data;
};

export const getUsersBySkill = async (skillId) => {
  const response = await api.get(`/api/users/skill/${skillId}`);
  return response.data;
};
