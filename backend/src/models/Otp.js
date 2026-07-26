'use strict';

const mongoose = require('mongoose');

/**
 * Transient OTP records. `expiresAt` has a TTL index so MongoDB auto-removes
 * expired codes — no cron needed. Codes are stored hashed, never in plaintext.
 */
const otpSchema = new mongoose.Schema(
  {
   mobile: 
  {
    type: String,
    required: true,
    trim: true,
    index: true,
    match: /^[0-9]{10,15}$/
  },
    codeHash: { type: String, required: true },
   attempts: 
   {
    type: Number,
    default: 0,
    min: 0,
    max: 10
   },
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
    enum: [
        'login',
        'change-mobile',
        'forgot-password'
    ],
    default: 'login'
 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index: document is deleted once `expiresAt` passes.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index
  (
    {
        mobile: 1,
        purpose: 1
    },
    {
        unique: true
    }
);
otpSchema.methods.toJSON = function ()
{
    const obj = this.toObject();

    delete obj.__v;
    delete obj.codeHash;

    return obj;
};

module.exports = mongoose.model('Otp', otpSchema);
