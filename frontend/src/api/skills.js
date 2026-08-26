import api from './axios';

export const getAllSkills = async () => {
  const response = await api.get('/api/skills');
  return response.data;
};

export const createSkill = async (name) => {
  const response = await api.post('/api/skills', { name });
  return response.data;
};

export const addSkillToUser = async (userId, skillId) => {
  const response = await api.post(`/api/skills/users/${userId}/skills/${skillId}`);
  return response.data;
};

export const removeSkillFromUser = async (userId, skillId) => {
  const response = await api.delete(`/api/skills/users/${userId}/skills/${skillId}`);
  return response.data;
};
