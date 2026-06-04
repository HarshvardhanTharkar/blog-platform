const express = require('express');
const router = express.Router();
const {
  getAllBlogs,
  searchBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');
const { blogRules, validate } = require('../middleware/validate');

// Public routes
router.get('/', getAllBlogs);
router.get('/search', searchBlogs);
router.get('/:id', getBlogById);

// Private routes
router.get('/user/my', protect, getMyBlogs);
router.post('/', protect, blogRules, validate, createBlog);
router.put('/:id', protect, blogRules, validate, updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;
