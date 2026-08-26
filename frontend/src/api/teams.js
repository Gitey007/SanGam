import api from './axios';

export const getAllTeams = async () => {
  const response = await api.get('/api/teams');
  return response.data;
};

export const getTeamById = async (teamId) => {
  const response = await api.get(`/api/teams/${teamId}`);
  return response.data;
};

export const createTeam = async (teamData) => {
  const response = await api.post('/api/teams', teamData);
  return response.data;
};

export const getTeamMembers = async (teamId) => {
  const response = await api.get(`/api/teams/${teamId}/members`);
  return response.data;
};

export const joinTeam = async (teamId) => {
  const response = await api.post(`/api/teams/${teamId}/join`);
  return response.data;
};

export const leaveTeam = async (teamId) => {
  const response = await api.delete(`/api/teams/${teamId}/leave`);
  return response.data;
};

export const removeMember = async (teamId, memberId) => {
  const response = await api.delete(`/api/teams/${teamId}/members/${memberId}`);
  return response.data;
};

export const sendJoinRequest = async (teamId) => {
  const response = await api.post(`/api/teams/${teamId}/join-request`);
  return response.data;
};

export const getJoinRequests = async (teamId) => {
  const response = await api.get(`/api/teams/${teamId}/join-requests`);
  return response.data;
};

export const acceptJoinRequest = async (teamId, requestId) => {
  const response = await api.post(`/api/teams/${teamId}/join-requests/${requestId}/accept`);
  return response.data;
};

export const rejectJoinRequest = async (teamId, requestId) => {
  const response = await api.post(`/api/teams/${teamId}/join-requests/${requestId}/reject`);
  return response.data;
};
