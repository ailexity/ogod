'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Guard a route by role. Use after `requireAuth`.
 *   router.get('/leads', requireAuth, requireRole('admin'), handler)
 */
function requireRole(...roles) {
  return function roleGuard(req, _res, next) {

    if (roles.length === 0) {
      return next(ApiError.internal("No roles configured."));
    }

    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const userRole = (req.user.role || "").toLowerCase();

    if (!roles.map(r => r.toLowerCase()).includes(userRole)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role: ${roles.join(", ")}`
        )
      );
    }

    return next();
  };
}

module.exports = requireRole;
