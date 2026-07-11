'use strict';

const crypto = require('crypto');
const path = require('path');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const sharp = require('sharp');
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * S3 media service. Images are compressed/resized with sharp BEFORE upload
 * (per the deployment guideline) and served through CloudFront when configured.
 *
 * If AWS credentials are absent (common in local dev), `isConfigured` is false
 * and callers should fall back to a placeholder / local behavior.
 */
const isConfigured = Boolean(
  env.aws.accessKeyId && env.aws.secretAccessKey && env.aws.s3Bucket
);

let s3 = null;
if (isConfigured) {
  s3 = new S3Client({
    region: env.aws.region,
    credentials: {
      accessKeyId: env.aws.accessKeyId,
      secretAccessKey: env.aws.secretAccessKey,
    },
  });
} else {
  logger.warn('S3 not configured — media uploads will be rejected until AWS creds are set.');
}

function publicUrl(key) {
  if (env.aws.cdnBaseUrl) {
    return `${env.aws.cdnBaseUrl.replace(/\/$/, '')}/${key}`;
  }
  return `https://${env.aws.s3Bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
}

/**
 * Compress + resize an image buffer, then upload to S3.
 * @param {Buffer} buffer    raw image bytes (from multer memoryStorage)
 * @param {string} originalName  used only to derive an extension
 * @param {'cover'|'gallery'} kind  controls the max dimension
 * @returns {Promise<{key:string,url:string,width:number,height:number}>}
 */
async function uploadImage(buffer, originalName, kind = 'gallery') {
  if (!isConfigured) {
    const err = new Error('S3 is not configured');
    err.statusCode = 503;
    throw err;
  }

  const maxWidth = kind === 'cover' ? 1600 : 1200;
  const processed = await sharp(buffer)
    .rotate() // respect EXIF orientation
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });

  const id = crypto.randomBytes(12).toString('hex');
  const key = `trips/${kind}/${Date.now()}-${id}.webp`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.aws.s3Bucket,
      Key: key,
      Body: processed.data,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  return {
    key,
    url: publicUrl(key),
    width: processed.info.width,
    height: processed.info.height,
    bytes: processed.info.size,
    originalExt: path.extname(originalName || ''),
  };
}

module.exports = { isConfigured, uploadImage, publicUrl };
