'use strict';

const mongoose = require('mongoose');

const TRIP_STATUS = ['live', 'paused', 'deleted', 'past'];

// Day-wise itinerary entry. Sub-document, no separate _id needed.
const itineraryDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, trim: true },
    locations: [{ type: String, trim: true }],
    timings: { type: String, trim: true },
    inclusions: [{ type: String, trim: true }],
    packingList: [{ type: String, trim: true }],
  },
  { _id: false }
);

// GeoJSON Point for the destination so we can do "popular near you".
const geoSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    // [longitude, latitude]
   coordinates:
{
    type: [Number],
    default: undefined,
    validate: 
    {
        validator(value) 
        {
            if (!value) return true;
            return value.length === 2;
        },
        message: "Coordinates must contain longitude and latitude."
    }
},
},
  { _id: false }
);

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    geo: { type: geoSchema, default: undefined },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 160 },

    // Open value — validated against the `categories` collection at write time,
    // never a hard-coded enum. Keeps the platform trip-type agnostic.
    category: { type: String, required: true, lowercase: true, trim: true, index: true },

    destination: { type: destinationSchema, required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    durationDays: { type: Number, min: 1 },

  pricePerPerson: 
  {
    type: Number,
    required: true,
    min: 0,
    max: 1000000
  },
    totalSeats: { type: Number, required: true, min: 1 },
    seatsRemaining: { type: Number, min: 0 },

    description: { type: String, trim: true, minlength: 20, maxlength: 5000 },
    meetingPoint: {
    type: String,
    trim: true,
     default: "",
    },

meetingTime: {
  type: String,
  default: "",
},
    itinerary: { type: [itineraryDaySchema], default: [] },

    coverPhotoUrl: { type: String, required: true },
    galleryUrls: 
  {
    type: [String],
    default: [],
    validate: 
    {
        validator(arr)
        {
            return arr.length <= 10;
        },
        message: "Maximum 10 gallery images allowed."
    }
},
    thumbnailUrl: 
{
    type: String,
     default: "",
},

    status: { type: String, enum: TRIP_STATUS, default: 'live', index: true },
    views: {
    type: Number,
    default: 0,
},
    publishedAt: 
    {
    type: Date,
    default: Date.now
     },

bookings: {
  type: Number,
  default: 0,
},
  },
  { timestamps: true }
);

// Geospatial index for location-based shelves.
tripSchema.index({ 'destination.geo': '2dsphere' });
// Text index powers the destination/keyword search bar.
tripSchema.index({ title: 'text', 'destination.name': 'text', description: 'text' });

// Default seatsRemaining to totalSeats and derive durationDays if omitted.
tripSchema.pre('validate', function preValidate(next) {
  if (this.seatsRemaining === undefined || this.seatsRemaining === null)
  {
    this.seatsRemaining = this.totalSeats;
  }
  if (this.seatsRemaining > this.totalSeats)
  {
    return next(
        new Error("Remaining seats cannot exceed total seats")
    );
    if (this.endDate < this.startDate) 
    {
    return next(
        new Error("End date cannot be before start date")
    );
    }
  }
  if (!this.durationDays && this.startDate && this.endDate)
  {
    const ms = this.endDate.getTime() - this.startDate.getTime();
    this.durationDays = Math.max(1, Math.round(ms / 86400000) + 1);
  }
  next();
});
tripSchema.pre("save", function (next) {

    if (this.seatsRemaining < 0) {
        this.seatsRemaining = 0;
    }

    if (this.seatsRemaining > this.totalSeats) {
        this.seatsRemaining = this.totalSeats;
    }

    next();

});

tripSchema.methods.toJSON = function () 
{
    const obj = this.toObject({
        virtuals: true
    });

    delete obj.__v;

    return obj;
};


tripSchema.statics.STATUS = TRIP_STATUS;
tripSchema.virtual("isAvailable").get(function () 
{
    return
    (
        this.status === "live" &&
        this.seatsRemaining > 0
    );
});
tripSchema.index
({
    category: 1,
    status: 1
});

tripSchema.index
({
    startDate: 1,
    status: 1
});

module.exports = mongoose.model('Trip', tripSchema);
