const { testConnection } = require('../config/db');

/**
 * Health check controller
 * Checks API liveness and tests PostgreSQL database connectivity
 */
const getHealthStatus = async (req, res, next) => {
  try {
    const dbStatus = await testConnection();

    res.status(200).json({
      success: true,
      message: 'API is running',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus.connected ? 'connected' : 'disconnected',
        details: dbStatus.message,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealthStatus,
};
