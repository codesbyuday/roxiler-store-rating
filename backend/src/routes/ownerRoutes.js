const express = require('express');
const ownerController = require('../controllers/ownerController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// All owner routes strictly require authentication AND the 'owner' role
router.use(authenticate, requireRole('owner'));

// Owner Dashboard
router.get('/dashboard', ownerController.getDashboard);

module.exports = router;
