import api from './api';

export const teamApi = {
  async getTeams() {
    const response = await api.get('/api/teams');
    return response.data;
  },

  async getTeamById(id) {
    if (!id) throw new Error('Team ID is required');

    const response = await api.get(`/api/teams/${id}`);
    return response.data;
  },

  async getTeamMembers(teamId) {
    if (!teamId) throw new Error('Team ID is required');

    const response = await api.get(`/api/teams/${teamId}/members`);
    return response.data;
  },

  async createTeam(teamData) {
    const response = await api.post('/api/teams', {
      name: teamData.name,
      description: teamData.description,
      leaderId: teamData.leaderId,
      maxMembers: teamData.maxMembers,
    });

    return response.data;
  },

  async sendJoinRequest(teamId, userId) {
    if (!teamId) throw new Error('Team ID is required');
    if (!userId) throw new Error('User ID is required');

    const response = await api.post(
      `/api/teams/${teamId}/join-request`,
      null,
      {
        params: {
          userId,
        },
      }
    );

    return response.data;
  },

  async getJoinRequests(teamId, leaderId) {
    const response = await api.get(
      `/api/teams/${teamId}/join-requests`,
      {
        params: {
          leaderId,
        },
      }
    );

    return response.data;
  },

  async acceptJoinRequest(teamId, requestId, leaderId) {
    const response = await api.post(
      `/api/teams/${teamId}/join-requests/${requestId}/accept`,
      null,
      {
        params: {
          leaderId,
        },
      }
    );

    return response.data;
  },

  async rejectJoinRequest(teamId, requestId, leaderId) {
    const response = await api.post(
      `/api/teams/${teamId}/join-requests/${requestId}/reject`,
      null,
      {
        params: {
          leaderId,
        },
      }
    );

    return response.data;
  },

  async leaveTeam(teamId, userId) {
    const response = await api.delete(
      `/api/teams/${teamId}/leave`,
      {
        params: {
          userId,
        },
      }
    );

    return response.data;
  },

  async removeMember(teamId, memberId, leaderId) {
    const response = await api.delete(
      `/api/teams/${teamId}/members/${memberId}`,
      {
        params: {
          leaderId,
        },
      }
    );

    return response.data;
  },
};

export default teamApi;