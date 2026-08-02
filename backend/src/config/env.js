'use strict';

require('dotenv').config();

/**
 * Centralized, validated environment access. Import this instead of reading
 * `process.env` directly so misconfiguration fails fast and loud.
 */
function required(key) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    // Don't hard-crash in dev for optional-in-dev keys; server.js decides.
    return undefined;
  }
  return value;
}

function bool(key, fallback = false) {
  const v = process.env[key];
  if (v === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}

function int(key, fallback) {
  const v = parseInt(process.env[key], 10);
  return Number.isNaN(v) ? fallback : v;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  port: int('PORT', 5000),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  mongoUri: required('MONGODB_URI'),

jwt: {
  secret: process.env.JWT_SECRET || 'dev-insecure-secret',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-insecure-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  refreshExpiresIn:
    process.env.JWT_REFRESH_EXPIRES_IN || '30d',
},

  otp: {
    ttlSeconds: int('OTP_TTL_SECONDS', 300),
    length: int('OTP_LENGTH', 6),
    devMode: bool('OTP_DEV_MODE', true),
    maxAttempts: 5,
  },

  sms: {
    provider: process.env.SMS_PROVIDER || 'none',
    msg91: {
      authKey: process.env.MSG91_AUTH_KEY,
      senderId: process.env.MSG91_SENDER_ID,
      templateId: process.env.MSG91_TEMPLATE_ID,
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM_NUMBER,
    },
  },

aws: 
{
    region: process.env.AWS_REGION || 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3Bucket: process.env.S3_BUCKET,
    cdnBaseUrl: process.env.CDN_BASE_URL,
},

googleMapsApiKey:
    required("GOOGLE_MAPS_API_KEY"),

adminMobile: process.env.ADMIN_MOBILE,
};

module.exports = env;
