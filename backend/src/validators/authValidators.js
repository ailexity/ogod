'use strict';

const { z } = require('zod');

const mobile = z
  .string()
  .min(10, 'Mobile number looks too short')
  .max(20, 'Mobile number looks too long');

const requestOtpSchema = z.object({
  mobile,
});

const verifyOtpSchema = z.object({
  mobile,
  code: z.string().min(4).max(8),
  // Sent on first-time sign-up to complete the profile.
  name: z.string().trim().min(1).max(120).optional(),
  organizationName: z.string().trim().max(160).optional(),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  organizationName: z.string().trim().max(160).optional(),
});

module.exports = { requestOtpSchema, verifyOtpSchema, updateProfileSchema };
