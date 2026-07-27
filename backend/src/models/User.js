'use strict';

const mongoose = require('mongoose');

const ROLES = [
  'poster',
  'traveler',
  'admin',
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    // Stored normalized (digits only, with country code, e.g. 919876543210).
mobile: {
  type: String,
  required: true,
  unique: true,
  index: true,
  trim: true,
  match: /^[0-9]{10,15}$/,
},
    organizationName: { type: String, trim: true, maxlength: 160 },
    profilePhoto: {
    type: String,
    default: "",
},
    role: { type: String, enum: ROLES, default: 'poster', index: true },
    // A user becomes verified the first time they complete OTP.
    isVerified: 
    {
    type: Boolean,
    default: false,
     },

lastLogin: 
{
  type: Date,
  default: null,
},
    refreshToken:
    {
    type: String,
    default: null
     },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
    const obj = this.toObject({
        virtuals: true,
    });

    delete obj.__v;
    delete obj.refreshToken;

    return obj;
};

userSchema.statics.ROLES = ROLES;
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
