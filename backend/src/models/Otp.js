'use strict';

const mongoose = require('mongoose');

/**
 * Transient OTP records. `expiresAt` has a TTL index so MongoDB auto-removes
 * expired codes — no cron needed. Codes are stored hashed, never in plaintext.
 */
const otpSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    ipAddress:
    {
      type: String,
       default: "",
    },
    userAgent: 
    {
     type: String,
     default: "",
    },
    // Purpose lets us reuse the collection for future flows (login, change-mobile).
purpose:
{
  type: String,
  enum: ["login", "register", "change-mobile", "reset-password"],
  default: "login",
},
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index: document is deleted once `expiresAt` passes.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);
