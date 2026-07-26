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
    fileSize: 5 * 1024 * 1024, // 5 MB per file (pre-compression)
    files: 11,
  },
  fileFilter(_req, file, cb) {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(ApiError.badRequest( "Only JPG, PNG, WEBP, HEIC, HEIF and GIF images are allowed."));
    }
    return cb(null, true);
  },
});
const tripImageUpload = upload.fields
(
  [
    {
        name: "coverImage",
        maxCount: 1
    },
    {
        name: "galleryImages",
        maxCount: 10
    }
  ]
);

module.exports = 
{
    upload,
    tripImageUpload,
    ALLOWED
};
