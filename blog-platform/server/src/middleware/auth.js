const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

/**
 * protect middleware
 * Validates Bearer JWT token from Authorization header.
 * Attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendError(res, 'Not authorized. No token provided.', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 'User belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please log in again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token. Please log in again.', 401);
    }
    return sendError(res, 'Authentication failed.', 401);
  }
};

/**
 * authorize middleware factory
 * Restricts access to users with specific roles.
 * Usage: authorize('admin') or authorize('admin', 'moderator')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Role '${req.user.role}' is not authorized to access this route.`,
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
