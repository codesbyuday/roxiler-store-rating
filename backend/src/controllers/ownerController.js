const ownerService = require('../services/ownerService');

/**
 * Handle Store Owner Dashboard retrieval
 */
const getDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const dashboardData = await ownerService.getDashboardData(ownerId);

    if (!dashboardData) {
      return res.status(404).json({
        success: false,
        message: 'No store associated with this owner account.'
      });
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard
};
