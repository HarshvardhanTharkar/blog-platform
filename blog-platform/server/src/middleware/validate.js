const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Runs after validation rules and returns 422 if any rule fails.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return sendError(res, 'Validation failed', 422, extractedErrors);
  }
  next();
};

// Auth validation rules
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

// Blog validation rules
const blogRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 150 }).withMessage('Title must be 5-150 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => tags.every((t) => typeof t === 'string')).withMessage('Each tag must be a string'),
];

const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  blogRules,
  updateProfileRules,
};
