'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const otpService = require('../services/otpService');
const { signToken } = require('../services/tokenService');

/**
 * POST /api/auth/request-otp
 * Body: { mobile }
 * Sends (or logs, in dev) an OTP to the given mobile.
 */
const requestOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

if (!mobile) {
    throw ApiError.badRequest("Mobile number is required");
}

const result = await otpService.requestOtp(mobile);
  return ok(res, {
    mobile: result.mobile,
    expiresInSeconds: result.expiresInSeconds,
    // devCode is only present when OTP_DEV_MODE=true.
    devCode: result.devCode,
    message: result.devCode
      ? 'OTP generated (dev mode). Use devCode to verify.'
      : 'OTP sent to your mobile number.',
  });
});

/**
 * POST /api/auth/verify-otp
 * Body: { mobile, code, name?, organizationName? }
 * Verifies the OTP, creates the poster on first login, returns a JWT.
 */
const verifyOtp = asyncHandler(async (req, res) => {
const {
  code,
  name,
  organizationName,
  role = "poster"
} = req.body;
  
  if (!req.body.mobile || !code)
  {
    throw ApiError.badRequest("Mobile and OTP are required");
 }
  const { mobile } = await otpService.verifyOtp(req.body.mobile, code);

  let user = await User.findOne({ mobile });
  const isNewUser = !user;

  if (!user) {
    // First-time sign-up requires a name to complete the basic profile.
    if (!name) {
      throw ApiError.badRequest('Name is required to complete sign-up', [
        { path: 'name', message: 'Required for new accounts' },
      ]);
    }
    user = await User.create({
      mobile,
      name,
      organizationName,
      role,
      isVerified: true,
    });
  } else if (!user.isVerified) {
    user.isVerified = true;
    if (name) user.name = name;
    if (organizationName !== undefined) user.organizationName = organizationName;
    await user.save();
  }
  user.lastLogin = new Date();
  await user.save();
  const token = signToken(user);
  return ok(res, {
    token,
    isNewUser,
    user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        organizationName: user.organizationName,
        role: user.role
    }
});

/** GET /api/auth/me — current authenticated user. */
const me = asyncHandler(async (req, res) => ok(res, { user: req.user }));

/** PATCH /api/auth/me — update basic profile fields. */
const updateMe = asyncHandler(async (req, res) => {
  const { name, organizationName } = req.body;
  if (name !== undefined) req.user.name = name;
  if (organizationName !== undefined) req.user.organizationName = organizationName;
  await req.user.save();
  return ok(res, { user: req.user });
});

module.exports = { requestOtp, verifyOtp, me, updateMe };
