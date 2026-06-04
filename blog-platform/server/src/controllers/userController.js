const User = require('../models/User');
const Blog = require('../models/Blog');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @route   GET /api/users/:id
 * @desc    Get public profile of any user (author profile view)
 * @access  Public
 */
const getAuthorProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    return sendError(res, 'User not found', 404);
  }

  // Get author's published blogs
  const blogs = await Blog.find({ author: req.params.id, published: true })
    .select('title excerpt tags createdAt readTime views')
    .sort({ createdAt: -1 })
    .limit(10);

  return sendSuccess(res, { user, blogs, blogCount: blogs.length });
};

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user's profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  const allowedFields = ['name', 'bio', 'avatar'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  return sendSuccess(res, { user }, 'Profile updated successfully');
};

/**
 * @route   PUT /api/users/change-password
 * @desc    Change current user's password
 * @access  Private
 */
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendError(res, 'Both current and new passwords are required', 400);
  }

  if (newPassword.length < 6) {
    return sendError(res, 'New password must be at least 6 characters', 400);
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    return sendError(res, 'Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save(); // Triggers pre-save hash hook

  return sendSuccess(res, {}, 'Password changed successfully');
};

module.exports = { getAuthorProfile, updateProfile, changePassword };
