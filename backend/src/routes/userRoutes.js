const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// All user routes strictly require authentication AND the 'user' role
router.use(authenticate, requireRole('user'));

// Store Listing for Normal Users
router.get('/stores', userController.getStores);

// Rating Management
router.post('/stores/:storeId/rating', userController.submitRating);
router.patch('/stores/:storeId/rating', userController.modifyRating);

module.exports = router;
