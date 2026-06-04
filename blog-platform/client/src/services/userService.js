import api from './api';

const userService = {
  getAuthorProfile: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data.data.user;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

export default userService;
