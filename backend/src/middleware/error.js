'use strict';

const multer = require('multer');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const env = require('../config/env');

/** 404 for unmatched routes — runs before the error handler. */
function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Central error handler. Normalizes Mongoose, Multer, JWT and Zod-derived
 * errors into the consistent `{ success:false, error }` envelope.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err instanceof multer.MulterError) 
  {
    statusCode = 400;
    message = `Upload error: ${err.message}`;
  } 
  else if (err.name === 'ValidationError') 
  {
    // Mongoose schema validation
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } 
  else if (err.name === 'CastError') 
  {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }
}
  else if (err.name === "JsonWebTokenError") 
  {
  statusCode = 401;
  message = "Invalid authentication token";
 } 
else if (err.name === "MongoServerError")
{
  statusCode = 500;
  message = "Database server error";
}
  else if (err.name === "TokenExpiredError")
  {
  statusCode = 401;
  message = "Authentication token has expired";
  }
  else if (err.code === 11000) 
  {
    // Mongo duplicate key
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with that ${field} already exists`;
  }

  if (statusCode >= 500) 
  {
    logger.error({
  method: req.method,
  url: req.originalUrl,
  statusCode,
  error: err.stack || err.message,
});
  }

 const body = {
  success: false,
  timestamp: new Date().toISOString(),
  error: {
    message,
  },
};
  if (details) body.error.details = details;
  if (!env.isProd && statusCode >= 500) body.error.stack = err.stack;

  res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };
