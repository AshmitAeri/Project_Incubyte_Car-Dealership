const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  toggleWishlist,
} = require('../controllers/authController');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const { registerValidation, loginValidation } = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.post('/wishlist/:carId', protect, toggleWishlist);

module.exports = router;
