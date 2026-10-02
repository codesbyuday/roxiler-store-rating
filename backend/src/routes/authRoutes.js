const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected Routes (Require Authentication)
router.patch('/password', authenticate, authController.changePassword);
router.get('/me', authenticate, authController.getMe);

// Test Protected Route (Require specific role: Admin)
router.get('/admin-test', authenticate, requireRole('admin'), authController.getAdminOnly);

module.exports = router;
