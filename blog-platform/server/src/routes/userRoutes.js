const express = require('express');
const router = express.Router();
const {
  getAuthorProfile,
  updateProfile,
  changePassword,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { updateProfileRules, validate } = require('../middleware/validate');

// GET /api/users/:id — public author profile
router.get('/:id', getAuthorProfile);

// PUT /api/users/profile — update own profile
router.put('/profile', protect, updateProfileRules, validate, updateProfile);

// PUT /api/users/change-password — change own password
router.put('/change-password', protect, changePassword);

module.exports = router;
