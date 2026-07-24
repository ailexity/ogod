'use strict';

const { verifyToken } = require('../services/tokenService');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');


function extractToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) return null;

  if (!authHeader.startsWith("Bearer ")) return null;

  return authHeader.substring(7).trim();
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

if (!user) 
{
  throw ApiError.unauthorized("Account no longer exists");
}

if (!user.isVerified)
{
  throw ApiError.unauthorized("Account is not verified");
}

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
    if (decoded.type && decoded.type !== "access")
{
    throw ApiError.unauthorized(
        "Access token required."
    );
}
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

  const authorize =
    (...roles) =>
    (req, res, next) =>
{
    if (!req.user)
    {
        return next(
            ApiError.unauthorized(
                "Authentication required."
            )
        );
    }

    if (!roles.includes(req.user.role))
    {
        return next(
            ApiError.forbidden(
                "You are not authorized to access this resource."
            )
        );
    }

    next();
};

module.exports =
{
    requireAuth,
    optionalAuth,
    authorize
};
