'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const s3 = require('../services/s3Service');

/**
 * POST /api/uploads/image  (poster)  field: "file"  query: ?kind=cover|gallery
 * Compresses + resizes, uploads to S3, returns the public/CDN URL to embed in
 * the trip's coverPhotoUrl / galleryUrls.
 */
const uploadSingle = asyncHandler(async (req, res) => {
  if (!s3.isConfigured) {
    throw new ApiError(503, 'Media storage is not configured on the server');
  }
  if (!req.file) throw ApiError.badRequest('No file uploaded (expected field "file")');
  const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

  if (req.file.size > 5 * 1024 * 1024) 
  {
  throw ApiError.badRequest(
    "Maximum file size is 5 MB."
  );
 }

if (!allowedTypes.includes(req.file.mimetype))
{
  throw ApiError.badRequest(
    "Only JPG, PNG and WEBP images are allowed."
  );
}

  const kind = req.query.kind === 'cover' ? 'cover' : 'gallery';
  const result = await s3.uploadImage(req.file.buffer, req.file.originalname, kind);
  return ok(res, { asset: result });
});

/**
 * POST /api/uploads/images  (poster)  field: "files" (up to 12)
 * Batch gallery upload.
 */
const uploadMany = asyncHandler(async (req, res) => {
  if (!s3.isConfigured) {
    throw new ApiError(503, 'Media storage is not configured on the server');
  }
  const files = req.files || [];
  if (files.length > 12)
  {
  throw ApiError.badRequest(
    "Maximum 12 images are allowed."
  );
}

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

for (const file of files)
{
  if (!allowedTypes.includes(file.mimetype))
  {
    throw ApiError.badRequest(
      "Only JPG, PNG and WEBP images are allowed."
    );
  }

  if (file.size > 5 * 1024 * 1024)
  {
    throw ApiError.badRequest(
      "Each image must be less than 5 MB."
    );
  }
}
  if (files.length === 0) throw ApiError.badRequest('No files uploaded (expected field "files")');

  const assets = await Promise.all(
    files.map((f) => s3.uploadImage(f.buffer, f.originalname, 'gallery'))
  );
  return ok(res,{
  asset: result,
  uploadedAt: new Date(),
});
});

module.exports = { uploadSingle, uploadMany };
