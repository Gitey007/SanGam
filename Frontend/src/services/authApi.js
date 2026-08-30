import api from './api';

export const authApi = {
  /**
   * Register a new student
   * POST /api/auth/register
   * Request body: { name, email, password, college, branch, year, bio }
   */
  async register(data) {
    const payload = {
      name: data.name?.trim(),
      email: data.email?.trim(),
      password: data.password,
      college: data.college?.trim(),
      branch: data.branch?.trim(),
      year: data.year ? parseInt(data.year, 10) : undefined,
      bio: data.bio?.trim() || '',
    };
    const response = await api.post('/api/auth/register', payload);
    return response.data;
  },

  /**
   * Login with email and password
   * POST /api/auth/login
   * Request body: { email, password }
   * Response: { token, id, name, email, college, branch, year }
   */
  async login(credentials) {
    const payload = {
      email: credentials.email?.trim(),
      password: credentials.password,
    };
    const response = await api.post('/api/auth/login', payload);
    return response.data;
  },

  /**
   * Request Email OTP
   * POST /api/auth/email/send-otp
   * Request body: { email }
   */
  async sendOtp(email) {
    const payload = {
      email: email?.trim(),
    };
    const response = await api.post('/api/auth/email/send-otp', payload);
    return response.data;
  },

  /**
   * Verify Email OTP
   * POST /api/auth/email/verify-otp
   * Request body: { email, otp }
   * Response: { token, id, name, email, college, branch, year }
   */
  async verifyOtp(email, otp) {
    const payload = {
      email: email?.trim(),
      otp: otp?.trim(),
    };
    const response = await api.post('/api/auth/email/verify-otp', payload);
    return response.data;
  },
};

export default authApi;
