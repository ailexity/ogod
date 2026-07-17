'use strict';

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Otp = require('../models/Otp');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { sendOtpSms } = require('./smsService');

/**
 * Normalize a raw mobile input to digits-only with a country code. Assumes
 * India (91) when a bare 10-digit number is supplied. Adjust here if you launch
 * in other regions.
 */
function normalizeMobile(raw) {
  if (!raw) throw ApiError.badRequest('Mobile number is required');
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) digits = `91${digits}`;
 if (!/^[0-9]{11,15}$/.test(digits)) 
{
 {
    throw ApiError.badRequest('Invalid mobile number');
  }
  return digits;
}

function generateCode(length) 
{
  // Cryptographically-random numeric code, zero-padded.
  const max = 10 ** length;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(length, '0');
}

/**
 * Create (or replace) an OTP for a mobile and deliver it. Returns the code only
 * in dev mode so the client/tester can complete the flow without real SMS.
 */
async function requestOtp(rawMobile) {
  const mobile = normalizeMobile(rawMobile);
  const existingOtp = await Otp.findOne({
    mobile,
    purpose: "login"
});

if (
    existingOtp &&
    existingOtp.createdAt &&
    Date.now() - existingOtp.createdAt.getTime() < 30000
   ) 
   {
    throw ApiError.tooMany(
        "Please wait 30 seconds before requesting another OTP."
    );
   }
  const code = generateCode(env.otp.length);
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + env.otp.ttlSeconds * 1000);

  // One active OTP per mobile — replace any previous one.
  await Otp.findOneAndUpdate(
    { mobile, purpose: 'login' },
    { mobile, purpose: 'login', codeHash, attempts: 0, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  try {
        await sendOtpSms(mobile, code);
      } 
  catch (error) 
  {
    throw ApiError.internal(
        "Unable to send OTP. Please try again."
    );
  }

  return {
    mobile,
    expiresInSeconds: env.otp.ttlSeconds,
    // Only leak the code when explicitly in dev mode.
    devCode: env.otp.devMode ? code : undefined,
  };
}

/**
 * Verify a submitted OTP. Consumes the record on success; enforces attempt
 * limits and expiry. Returns the normalized mobile so the caller can find/create
 * the user.
 */
async function verifyOtp(rawMobile, submittedCode) {
  const mobile = normalizeMobile(rawMobile);
  if (!submittedCode) throw ApiError.badRequest('OTP code is required');
  if (!/^[0-9]{6}$/.test(String(submittedCode))) 
  {
    throw ApiError.badRequest(
        "OTP must be exactly 6 digits."
    );
  }
  const record = await Otp.findOne({ mobile, purpose: 'login' });
  if (!record) throw ApiError.badRequest('No OTP requested for this number, or it expired');

  if (record.expiresAt.getTime() < Date.now()) {
    await record.deleteOne();
    throw ApiError.badRequest('OTP expired, please request a new one');
  }

  if (record.attempts >= env.otp.maxAttempts) {
    await record.deleteOne();
    throw ApiError.tooMany('Too many incorrect attempts, please request a new OTP');
  }

  const matches = await bcrypt.compare(String(submittedCode), record.codeHash);
  if (!matches) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest('Incorrect OTP');
  }

  await record.deleteOne();
  console.log
    (
    `OTP verified successfully for ${mobile}`
    );
  return { mobile };
}

module.exports = { normalizeMobile, requestOtp, verifyOtp };
