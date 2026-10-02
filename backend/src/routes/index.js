const express = require('express');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

// Mount health check route under /api/health
router.use('/health', healthRoutes);

module.exports = router;
