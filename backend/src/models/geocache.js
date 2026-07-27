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
            required: true,
            trim: true
        },

        location: {
            lat: {
                type: Number,
                required: true,
                min: -90,
                max: 90
            },

            lng: {
                type: Number,
                required: true,
                min: -180,
                max: 180
            }
        },

        placeId: {
            type: String,
            default: null,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

geoCacheSchema.index(
    {
        createdAt: 1
    },
    {
        expireAfterSeconds: 31536000
    }
);

geoCacheSchema.methods.toJSON = function () {
    const obj = this.toObject();

    delete obj.__v;

    return obj;
};

module.exports = mongoose.model('GeoCache', geoCacheSchema);
