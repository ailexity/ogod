'use strict';

const mongoose = require('mongoose');

const geoCacheSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    formattedAddress: {
      type: String,
      required: true
    },
    location: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    },
    placeId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

geoCacheSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 365 }
);

module.exports = mongoose.model('GeoCache', geoCacheSchema);
