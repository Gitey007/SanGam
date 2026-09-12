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
      otp: data.otp?.trim() || undefined,
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
   * Response: { message, email, verified }
   */
  async verifyOtp(email, otp) {
    const payload = {
      email: email?.trim(),
      otp: otp?.trim(),
    };
    const response = await api.post('/api/auth/email/verify-otp', payload);
    return response.data;
  },

  /**
   * Forgot Password - Request OTP
   * POST /api/auth/forgot-password/send-otp
   * Request body: { email }
   */
  async forgotPasswordSendOtp(email) {
    const payload = {
      email: email?.trim(),
    };
    const response = await api.post('/api/auth/forgot-password/send-otp', payload);
    return response.data;
  },

  /**
   * Forgot Password - Verify OTP
   * POST /api/auth/forgot-password/verify-otp
   * Request body: { email, otp }
   */
  async forgotPasswordVerifyOtp(email, otp) {
    const payload = {
      email: email?.trim(),
      otp: otp?.trim(),
    };
    const response = await api.post('/api/auth/forgot-password/verify-otp', payload);
    return response.data;
  },

  /**
   * Forgot Password - Reset Password
   * POST /api/auth/forgot-password/reset
   * Request body: { email, newPassword }
   */
  async forgotPasswordReset(email, newPassword) {
    const payload = {
      email: email?.trim(),
      newPassword,
    };
    const response = await api.post('/api/auth/forgot-password/reset', payload);
    return response.data;
  },

  /**
   * Change Password (Authenticated)
   * POST /api/auth/change-password
   * Request body: { currentPassword, newPassword, confirmPassword }
   */
  async changePassword(data) {
    const payload = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    };
    const response = await api.post('/api/auth/change-password', payload);
    return response.data;
  },
};

export default authApi;
