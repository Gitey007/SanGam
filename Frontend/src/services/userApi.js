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
   * Request body: { name, college, branch, year, bio }
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
      bio: data.bio?.trim() || '',
    };
    const response = await api.put(`/api/users/${id}`, payload);
    return response.data;
  },
};

export default userApi;
