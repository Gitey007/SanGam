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
      projectName: teamData.projectName,
      projectDescription: teamData.projectDescription,
      teamVision: teamData.teamVision,
      projectType: teamData.projectType,
      hackathonName: teamData.hackathonName,
      hackathonUrl: teamData.hackathonUrl,
      hackathonDeadline: teamData.hackathonDeadline,
      githubRepositoryUrl: teamData.githubRepositoryUrl,
      documentationUrl: teamData.documentationUrl,
      leaderRole: teamData.leaderRole,
      leaderCustomRole: teamData.leaderCustomRole,
      requiredSkills: teamData.requiredSkills,
      requiredRoles: teamData.requiredRoles,
      roleSlots: teamData.roleSlots,
    });

    return response.data;
  },

  async updateTeam(teamId, teamData) {
    if (!teamId) throw new Error('Team ID is required');

    const response = await api.put(`/api/teams/${teamId}`, {
      name: teamData.name,
      description: teamData.description,
      maxMembers: teamData.maxMembers,
      projectName: teamData.projectName,
      projectDescription: teamData.projectDescription,
      teamVision: teamData.teamVision,
      projectType: teamData.projectType,
      hackathonName: teamData.hackathonName,
      hackathonUrl: teamData.hackathonUrl,
      hackathonDeadline: teamData.hackathonDeadline,
      joinDeadline: teamData.joinDeadline,
      githubRepositoryUrl: teamData.githubRepositoryUrl,
      documentationUrl: teamData.documentationUrl,
      requiredSkills: teamData.requiredSkills,
      requiredRoles: teamData.requiredRoles,
      roleSlots: teamData.roleSlots,
    });

    return response.data;
  },

  async extendDeadline(teamId, joinDeadline) {
    if (!teamId) throw new Error('Team ID is required');
    const response = await api.put(`/api/teams/${teamId}/deadline`, {
      joinDeadline,
    });
    return response.data;
  },

  async sendJoinRequest(teamId, userId, requestedRole = null, customRole = null) {
    if (!teamId) throw new Error('Team ID is required');

    const response = await api.post(
      `/api/teams/${teamId}/join-request`,
      {
        userId,
        requestedRole,
        customRole,
      },
      {
        params: {
          ...(userId ? { userId } : {}),
          ...(requestedRole ? { requestedRole } : {}),
          ...(customRole ? { customRole } : {}),
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

  async acceptJoinRequest(teamId, requestId, leaderId, selectedRole = null, customRole = null, memberIdToRemove = null) {
    const response = await api.post(
      `/api/teams/${teamId}/join-requests/${requestId}/accept`,
      {
        leaderId,
        selectedRole,
        customRole,
        memberIdToRemove,
      },
      {
        params: {
          ...(leaderId ? { leaderId } : {}),
          ...(selectedRole ? { selectedRole } : {}),
          ...(customRole ? { customRole } : {}),
          ...(memberIdToRemove ? { memberIdToRemove } : {}),
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

  async inviteStudentToTeam(teamId, userId, invitedRole = null, customRole = null) {
    if (!teamId) throw new Error('Team ID is required');
    if (!userId) throw new Error('User ID is required');

    const response = await api.post(
      `/api/teams/${teamId}/invite/${userId}`,
      {
        invitedRole,
        customRole,
      },
      {
        params: {
          ...(invitedRole ? { invitedRole } : {}),
          ...(customRole ? { customRole } : {}),
        },
      }
    );
    return response.data;
  },

  async getMyTeamInvitations(status) {
    const response = await api.get('/api/teams/invitations/my', {
      params: status ? { status } : {},
    });
    return response.data;
  },

  async getTeamInvitations(teamId) {
    if (!teamId) throw new Error('Team ID is required');

    const response = await api.get(`/api/teams/${teamId}/invitations`);
    return response.data;
  },

  async acceptTeamInvitation(invitationId, selectedRole = null, customRole = null) {
    if (!invitationId) throw new Error('Invitation ID is required');

    const response = await api.post(
      `/api/teams/invitations/${invitationId}/accept`,
      {
        selectedRole,
        customRole,
      },
      {
        params: {
          ...(selectedRole ? { selectedRole } : {}),
          ...(customRole ? { customRole } : {}),
        },
      }
    );
    return response.data;
  },

  async rejectTeamInvitation(invitationId) {
    if (!invitationId) throw new Error('Invitation ID is required');

    const response = await api.post(`/api/teams/invitations/${invitationId}/reject`);
    return response.data;
  },

  async requestAnotherRole(invitationId, requestedRole, customRole = null) {
    if (!invitationId) throw new Error('Invitation ID is required');

    const response = await api.post(
      `/api/teams/invitations/${invitationId}/request-another`,
      {
        requestedRole,
        customRole,
      },
      {
        params: {
          ...(requestedRole ? { requestedRole } : {}),
          ...(customRole ? { customRole } : {}),
        },
      }
    );
    return response.data;
  },

  async deleteTeam(teamId) {
    if (!teamId) throw new Error('Team ID is required');

    const response = await api.delete(`/api/teams/${teamId}`);
    return response.data;
  },

  async getMyJoinRequests() {
    const response = await api.get('/api/teams/my-join-requests');
    return response.data;
  },

  async cancelJoinRequest(teamId, requestId) {
    if (!requestId) throw new Error('Request ID is required');
    const url = teamId
      ? `/api/teams/${teamId}/join-requests/${requestId}`
      : `/api/teams/join-requests/${requestId}`;
    const response = await api.delete(url);
    return response.data;
  },

  async cancelTeamInvitation(teamId, invitationId) {
    if (!invitationId) throw new Error('Invitation ID is required');
    const url = teamId
      ? `/api/teams/${teamId}/invitations/${invitationId}`
      : `/api/teams/invitations/${invitationId}`;
    const response = await api.delete(url);
    return response.data;
  },

  async getNotifications() {
    const response = await api.get('/api/notifications');
    return response.data;
  },

  async markNotificationAsRead(notificationId) {
    if (!notificationId) throw new Error('Notification ID is required');
    const response = await api.post(`/api/notifications/${notificationId}/read`);
    return response.data;
  },

  async deleteNotification(notificationId) {
    if (!notificationId) throw new Error('Notification ID is required');
    const response = await api.delete(`/api/notifications/${notificationId}`);
    return response.data;
  },

  async clearAllNotifications() {
    const response = await api.delete('/api/notifications');
    return response.data;
  },
};

export default teamApi;