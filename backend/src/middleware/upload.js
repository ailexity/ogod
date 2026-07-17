'use strict';

const multer = require('multer');
const ApiError = require('../utils/ApiError');

/**
 * In-memory upload so images can be compressed with sharp before hitting S3.
 * Files are small (trip photos) and processed immediately, so memoryStorage is
 * appropriate. Limits guard against oversized uploads.
 */
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif','image/gif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file (pre-compression)
    files: 12,
  },
  fileFilter(_req, file, cb) {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(ApiError.badRequest( "Only JPG, PNG, WEBP, HEIC and HEIF images are allowed."));
    }
    return cb(null, true);
  },
});

module.exports = upload;
