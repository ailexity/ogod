'use strict';

const mongoose = require('mongoose');

/**
 * An inquiry captured before contact details are revealed to the traveler.
 * Saved to the admin dashboard and passed to the poster. Travelers are
 * anonymous (no account), so the lead carries their name/mobile directly.
 */
const leadSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
    // Denormalized so the admin table and poster views avoid an extra lookup.
    posterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tripTitle: { type: String, trim: true },

    travelerName: { type: String, required: true, trim: true, maxlength: 120 },
   travelerMobile:
   {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{10,15}$/,
   },
    destinationInterest: { type: String, trim: true },
    requirements: { type: String, trim: true, maxlength: 1000 },
    whatsappMessage:
{
    type: String,
    default: ""
},
    status: 
    {
     type: String,
     enum: ["new", "contacted", "converted", "closed"],
     default: "new",
     index: true,
    },
    contactedAt:
{
    type: Date,
    default: null
},
    source: 
    {
     type: String,
     default: "mobile-app",
    },
  },
  { timestamps: true }
);

// Common admin filters: by date, by trip, by poster.
leadSchema.index({ createdAt: -1, posterId: 1});
leadSchema.index
({
    tripId: 1,
    createdAt: -1
});

leadSchema.index
({
    status: 1,
    createdAt: -1
});
leadSchema.methods.toJSON = function () 
{
    const obj = this.toObject();

    delete obj.__v;

    return obj;
};

module.exports = mongoose.model('Lead', leadSchema);
