import api from './api';

const blogService = {
  getAllBlogs: async (params = {}) => {
    const response = await api.get('/blogs', { params });
    return response.data.data;
  },

  searchBlogs: async (query, params = {}) => {
    const response = await api.get('/blogs/search', { params: { q: query, ...params } });
    return response.data.data;
  },

  getBlogById: async (id) => {
    const response = await api.get(`/blogs/${id}`);
    return response.data.data.blog;
  },

  getMyBlogs: async (params = {}) => {
    const response = await api.get('/blogs/user/my', { params });
    return response.data.data;
  },

  createBlog: async (blogData) => {
    const response = await api.post('/blogs', blogData);
    return response.data.data.blog;
  },

  updateBlog: async (id, blogData) => {
    const response = await api.put(`/blogs/${id}`, blogData);
    return response.data.data.blog;
  },

  deleteBlog: async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },
};

export default blogService;
