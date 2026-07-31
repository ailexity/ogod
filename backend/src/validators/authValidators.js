'use strict';

const { z } = require('zod');

const mobile = z
  .string()
  .trim()
  .regex(/^[0-9]{10,15}$/, "Mobile number must contain 10 to 15 digits");

const requestOtpSchema = z.object({
  mobile,
}).strict();

const verifyOtpSchema = z.object({
  mobile,
  code: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^[0-9]+$/),
  // Sent on first-time sign-up to complete the profile.
  name: z.string().trim().min(1).max(120).optional(),
  organizationName: z.string().trim().max(160).optional(),
}).strict();

const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  organizationName: z.string().trim().max(160).optional(),
}).strict();

module.exports = { requestOtpSchema, verifyOtpSchema, updateProfileSchema };
