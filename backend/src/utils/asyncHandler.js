'use strict';

/**
 * Wrap an async route handler so rejected promises flow to the error middleware
 * instead of hanging the request.
 */
module.exports = function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
