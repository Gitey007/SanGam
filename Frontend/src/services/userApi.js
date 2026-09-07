import api from './api';

export const userApi = {
  /**
   * Discover and list users based on scope, year, and skill.
   * GET /api/users?scope=...&year=...&skill=...
   * 
   * @param {Object} filters
   * @param {'ALL' | 'MY_COLLEGE' | 'INTER_COLLEGE'} [filters.scope]
   * @param {number|string} [filters.year]
   * @param {string} [filters.skill]
   */
  async getUsers(filters = {}) {
    const params = {};

    if (filters.scope && filters.scope !== 'ALL') {
      params.scope = filters.scope;
    } else if (filters.scope === 'ALL') {
      params.scope = 'ALL';
    }

    if (filters.year && filters.year !== '') {
      params.year = filters.year;
    }

    if (filters.skill && filters.skill.trim() !== '') {
      params.skill = filters.skill.trim();
    }

    const response = await api.get('/api/users', { params });
    return response.data;
  },

  /**
   * Get user profile by ID
   * GET /api/users/{id}
   * Response: { id, name, email, college, branch, year, bio, skills }
   * 
   * @param {string|number} id
   */
  async getUser(id) {
    if (!id) throw new Error('User ID is required');
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  /**
   * Update user profile
   * PUT /api/users/{id}
   * 
   * @param {string|number} id
   * @param {Object} data
   */
  async updateUser(id, data) {
    if (!id) throw new Error('User ID is required');
    const payload = {
      name: data.name?.trim(),
      college: data.college?.trim(),
      branch: data.branch?.trim(),
      year: data.year ? parseInt(data.year, 10) : undefined,
      bio: data.bio !== undefined ? data.bio.trim() : undefined,
      githubUrl: data.githubUrl !== undefined ? data.githubUrl.trim() : undefined,
      linkedinUrl: data.linkedinUrl !== undefined ? data.linkedinUrl.trim() : undefined,
      portfolioUrl: data.portfolioUrl !== undefined ? data.portfolioUrl.trim() : undefined,
      leetcodeUrl: data.leetcodeUrl !== undefined ? data.leetcodeUrl.trim() : undefined,
      otherUrl: data.otherUrl !== undefined ? data.otherUrl.trim() : undefined,
      lookingFor: data.lookingFor || undefined,
    };
    const response = await api.put(`/api/users/${id}`, payload);
    return response.data;
  },

  /**
   * Add a skill to user profile
   * POST /api/users/{id}/skills
   */
  async addSkill(userId, skillName) {
    if (!userId || !skillName) throw new Error('User ID and skill name are required');
    const response = await api.post(`/api/users/${userId}/skills`, { skillName: skillName.trim() });
    return response.data;
  },

  /**
   * Remove a skill from user profile
   * DELETE /api/users/{id}/skills/{skillName}
   */
  async removeSkill(userId, skillName) {
    if (!userId || !skillName) throw new Error('User ID and skill name are required');
    const response = await api.delete(`/api/users/${userId}/skills/${encodeURIComponent(skillName.trim())}`);
    return response.data;
  },

  /**
   * Add achievement to user profile
   * POST /api/users/{id}/achievements
   */
  async addAchievement(userId, data) {
    if (!userId) throw new Error('User ID is required');
    const response = await api.post(`/api/users/${userId}/achievements`, data);
    return response.data;
  },

  /**
   * Update achievement
   * PUT /api/users/{id}/achievements/{achievementId}
   */
  async updateAchievement(userId, achievementId, data) {
    if (!userId || !achievementId) throw new Error('User ID and achievement ID are required');
    const response = await api.put(`/api/users/${userId}/achievements/${achievementId}`, data);
    return response.data;
  },

  /**
   * Delete achievement
   * DELETE /api/users/{id}/achievements/{achievementId}
   */
  async deleteAchievement(userId, achievementId) {
    if (!userId || !achievementId) throw new Error('User ID and achievement ID are required');
    const response = await api.delete(`/api/users/${userId}/achievements/${achievementId}`);
    return response.data;
  },

  /**
   * Add project to user profile
   * POST /api/users/{id}/projects
   */
  async addProject(userId, data) {
    if (!userId) throw new Error('User ID is required');
    const response = await api.post(`/api/users/${userId}/projects`, data);
    return response.data;
  },

  /**
   * Update project
   * PUT /api/users/{id}/projects/{projectId}
   */
  async updateProject(userId, projectId, data) {
    if (!userId || !projectId) throw new Error('User ID and project ID are required');
    const response = await api.put(`/api/users/${userId}/projects/${projectId}`, data);
    return response.data;
  },

  /**
   * Delete project
   * DELETE /api/users/{id}/projects/{projectId}
   */
  async deleteProject(userId, projectId) {
    if (!userId || !projectId) throw new Error('User ID and project ID are required');
    const response = await api.delete(`/api/users/${userId}/projects/${projectId}`);
    return response.data;
  },
};

export default userApi;
