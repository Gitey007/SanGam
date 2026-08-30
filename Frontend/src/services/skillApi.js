import api from './api';

export const skillApi = {
  /**
   * Get all available skills
   * GET /api/skills
   */
  async getAllSkills() {
    const response = await api.get('/api/skills');
    return response.data;
  },

  /**
   * Get skill by ID
   * GET /api/skills/{id}
   * @param {string|number} id
   */
  async getSkillById(id) {
    if (!id) throw new Error('Skill ID is required');
    const response = await api.get(`/api/skills/${id}`);
    return response.data;
  },

  /**
   * Add skill to user profile
   * POST /api/skills/users/{userId}/skills/{skillId}
   * @param {string|number} userId
   * @param {string|number} skillId
   */
  async addSkillToUser(userId, skillId) {
    if (!userId) throw new Error('User ID is required');
    if (!skillId) throw new Error('Skill ID is required');
    const response = await api.post(`/api/skills/users/${userId}/skills/${skillId}`);
    return response.data;
  },

  /**
   * Get users associated with a specific skill ID
   * GET /api/users/skill/{skillId}
   * @param {string|number} skillId
   */
  async getUsersBySkillId(skillId) {
    if (!skillId) throw new Error('Skill ID is required');
    const response = await api.get(`/api/users/skill/${skillId}`);
    return response.data;
  },
};

export default skillApi;

