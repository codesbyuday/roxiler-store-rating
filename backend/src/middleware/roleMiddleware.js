/**
 * Middleware to restrict access to specific roles
 * @param  {...string} allowedRoles - List of allowed roles (e.g., 'admin', 'user')
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure the user is already authenticated (authMiddleware must run first)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required before checking role'
      });
    }

    // Check if the user's role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to perform this action'
      });
    }

    next();
  };
};

module.exports = {
  requireRole
};
