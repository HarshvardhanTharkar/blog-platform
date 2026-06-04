const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules, validate } = require('../middleware/validate');

// POST /api/auth/register
router.post('/register', registerRules, validate, register);

// POST /api/auth/login
router.post('/login', loginRules, validate, login);

// POST /api/auth/logout  (requires auth for audit trail)
router.post('/logout', protect, logout);

// GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
