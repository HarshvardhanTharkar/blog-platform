import api from './api';

const authService = {
  /**
   * Register a new user.
   * Stores token and user in localStorage on success.
   */
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  /**
   * Login with email and password.
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  /**
   * Logout — calls server endpoint (for audit), then clears local storage.
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Logout even if server call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Get the currently authenticated user from the server.
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.data.user;
  },

  /**
   * Returns the locally stored user object (non-async, for initial render).
   */
  getStoredUser: () => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  },

  getToken: () => localStorage.getItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token'),
};

export default authService;
