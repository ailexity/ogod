'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/authController');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  requestOtpSchema,
  verifyOtpSchema,
  updateProfileSchema,
} = require('../validators/authValidators');

const router = express.Router();

// Throttle OTP requests to blunt SMS-pumping / brute force.
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many OTP requests, try again later.' } },
});

router.post('/request-otp', otpLimiter, validate(requestOtpSchema), controller.requestOtp);
router.post
  (
    '/resend-otp',
    otpLimiter,
    validate(requestOtpSchema),
    controller.resendOtp
  );
router.post
  (
    '/verify-otp',
    otpLimiter,
    validate(verifyOtpSchema),
    controller.verifyOtp
  );
router.get('/me', requireAuth, controller.me);
router.patch('/me', requireAuth, validate(updateProfileSchema), controller.updateMe);
router.post('/logout', requireAuth, controller.logout);

module.exports = router;
