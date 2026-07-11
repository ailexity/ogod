'use strict';

const { verifyToken } = require('../services/tokenService');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
}

/**
 * Require a valid JWT. Attaches `req.user` (the DB document) and `req.auth`
 * (the decoded token). Rejects with 401 on any failure.
 */
const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required');

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (_e) {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(decoded.sub);
  if (!user) throw ApiError.unauthorized('Account no longer exists');

  req.auth = decoded;
  req.user = user;
  next();
});

/**
 * Attach `req.user` if a valid token is present, but never reject. Used on
 * public endpoints that behave slightly differently for signed-in posters.
 */
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);
    if (user) {
      req.auth = decoded;
      req.user = user;
    }
  } catch (_e) {
    /* ignore — treat as anonymous */
  }
  next();
});

module.exports = { requireAuth, optionalAuth };
