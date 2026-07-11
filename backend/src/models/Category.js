'use strict';

const mongoose = require('mongoose');

/**
 * Open, admin-extendable trip categories. Trips reference categories by `slug`.
 * Adding a new trip type = adding a document here, NEVER a code change. This is
 * what keeps Ogod generic across pilgrimages, treks, getaways, corporate outings…
 */
const categorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    label: { type: String, required: true, trim: true },
    imageUrl: { type: String, trim: true },
    sortOrder: { type: Number, default: 100 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
