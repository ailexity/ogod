'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Guard a route by role. Use after `requireAuth`.
 *   router.get('/leads', requireAuth, requireRole('admin'), handler)
 */
function requireRole(...roles) {
  return function roleGuard(req, _res, next) {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have access to this resource'));
    }
    return next();
  };
}

module.exports = requireRole;
