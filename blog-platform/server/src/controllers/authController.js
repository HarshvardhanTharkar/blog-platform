const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError, sendCreated } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Generate a signed JWT for a given user ID.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 'An account with this email already exists', 409);
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  logger.info(`New user registered: ${user.email}`);

  return sendCreated(res, {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  }, 'Registration successful');
};

/**
 * @route   POST /api/auth/login
 * @desc    Login and receive JWT
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select password (hidden by default via select:false)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return sendError(res, 'Invalid email or password', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return sendError(res, 'Invalid email or password', 401);
  }

  const token = generateToken(user._id);

  logger.info(`User logged in: ${user.email}`);

  return sendSuccess(res, {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  }, 'Login successful');
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (client-side token deletion; endpoint for audit logging)
 * @access  Private
 */
const logout = async (req, res) => {
  logger.info(`User logged out: ${req.user.email}`);
  return sendSuccess(res, {}, 'Logged out successfully');
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user
 * @access  Private
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('blogCount');
  return sendSuccess(res, { user }, 'User retrieved successfully');
};

module.exports = { register, login, logout, getMe };
