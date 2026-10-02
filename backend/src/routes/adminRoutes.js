const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// All admin routes strictly require authentication AND the 'admin' role
router.use(authenticate, requireRole('admin'));

// Dashboard Stats
router.get('/dashboard', adminController.getDashboard);

// User Management
router.post('/users', adminController.createUser);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);

// Store Management
router.post('/stores', adminController.createStore);
router.get('/stores', adminController.getStores);

module.exports = router;
