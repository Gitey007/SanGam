import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

export const healthApi = {
  /**
   * Ping backend health endpoint (GET /api/health)
   * Used to check whether backend has woken up from Render cold start.
   * 
   * @param {number} timeoutMs
   * @returns {Promise<boolean>}
   */
  async checkHealth(timeoutMs = 8000) {
    try {
      const url = `${API_BASE_URL}/api/health`;
      const response = await axios.get(url, {
        timeout: timeoutMs,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      return (
        response.status === 200 &&
        response.data &&
        (response.data.status === 'UP' || response.data.status === 'OK')
      );
    } catch (err) {
      return false;
    }
  },
};

export default healthApi;
