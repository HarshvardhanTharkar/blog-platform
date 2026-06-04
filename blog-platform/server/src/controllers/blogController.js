const Blog = require('../models/Blog');
const { sendSuccess, sendError, sendCreated } = require('../utils/response');

/**
 * @route   GET /api/blogs
 * @desc    Get all published blogs with pagination and filtering
 * @access  Public
 */
const getAllBlogs = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const query = { published: true };

  // Tag filter
  if (req.query.tag) {
    query.tags = req.query.tag.toLowerCase();
  }

  // Author filter
  if (req.query.author) {
    query.author = req.query.author;
  }

  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .populate('author', 'name email avatar bio')
      .select('-content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Blog.countDocuments(query),
  ]);

  return sendSuccess(res, {
    blogs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  });
};

/**
 * @route   GET /api/blogs/search
 * @desc    Full-text search on title, content, tags
 * @access  Public
 */
const searchBlogs = async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return sendError(res, 'Search query must be at least 2 characters', 400);
  }

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const searchQuery = {
    $text: { $search: q },
    published: true,
  };

  const [blogs, total] = await Promise.all([
    Blog.find(searchQuery, { score: { $meta: 'textScore' } })
      .populate('author', 'name email avatar')
      .select('-content')
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Blog.countDocuments(searchQuery),
  ]);

  return sendSuccess(res, {
    blogs,
    query: q,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

/**
 * @route   GET /api/blogs/:id
 * @desc    Get single blog by ID (increments view count)
 * @access  Public
 */
const getBlogById = async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
    { _id: req.params.id, published: true },
    { $inc: { views: 1 } },
    { new: true }
  ).populate('author', 'name email avatar bio createdAt');

  if (!blog) {
    return sendError(res, 'Blog not found', 404);
  }

  return sendSuccess(res, { blog });
};

/**
 * @route   POST /api/blogs
 * @desc    Create a new blog
 * @access  Private
 */
const createBlog = async (req, res) => {
  const { title, content, tags, coverImage, published } = req.body;

  const blog = await Blog.create({
    title,
    content,
    tags: tags || [],
    coverImage: coverImage || '',
    published: published !== undefined ? published : true,
    author: req.user._id,
  });

  await blog.populate('author', 'name email avatar');

  return sendCreated(res, { blog }, 'Blog created successfully');
};

/**
 * @route   PUT /api/blogs/:id
 * @desc    Update a blog (author only)
 * @access  Private
 */
const updateBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return sendError(res, 'Blog not found', 404);
  }

  // Ownership check: only the author or an admin can update
  if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this blog', 403);
  }

  const allowedUpdates = ['title', 'content', 'tags', 'coverImage', 'published', 'excerpt'];
  const updates = {};
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('author', 'name email avatar');

  return sendSuccess(res, { blog: updatedBlog }, 'Blog updated successfully');
};

/**
 * @route   DELETE /api/blogs/:id
 * @desc    Delete a blog (author or admin only)
 * @access  Private
 */
const deleteBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return sendError(res, 'Blog not found', 404);
  }

  if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to delete this blog', 403);
  }

  await blog.deleteOne();

  return sendSuccess(res, {}, 'Blog deleted successfully');
};

/**
 * @route   GET /api/blogs/my
 * @desc    Get all blogs by the authenticated user (incl. drafts)
 * @access  Private
 */
const getMyBlogs = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [blogs, total] = await Promise.all([
    Blog.find({ author: req.user._id })
      .select('-content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Blog.countDocuments({ author: req.user._id }),
  ]);

  return sendSuccess(res, {
    blogs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

module.exports = {
  getAllBlogs,
  searchBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
};
