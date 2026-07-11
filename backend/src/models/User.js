'use strict';

const mongoose = require('mongoose');

const ROLES = ['poster', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    // Stored normalized (digits only, with country code, e.g. 919876543210).
    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    organizationName: { type: String, trim: true, maxlength: 160 },
    role: { type: String, enum: ROLES, default: 'poster', index: true },
    // A user becomes verified the first time they complete OTP.
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', userSchema);
