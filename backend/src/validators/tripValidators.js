'use strict';

const { z } = require('zod');

const itineraryDay = z.object({
  day: z.number().int().positive(),
  title: z.string().trim().max(160).optional(),
  locations: z.array(z.string().trim()).default([]),
  timings: z.string().trim().optional(),
  inclusions: z.array(z.string().trim()).default([]),
  packingList: z.array(z.string().trim()).default([]),
});

const destination = z.object({
  name: z.string().trim().min(1, 'Destination name is required'),
  geo: z
    .object({
      type: z.literal('Point').default('Point'),
      // [longitude, latitude]
      coordinates: z.tuple([z.number(), z.number()]),
    })
    .optional(),
});

// Dates arrive as ISO strings from the clients; coerce to Date.
const isoDate = z.coerce.date();

const createTripSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    category: z.string().trim().min(1),
    destination,
    startDate: isoDate,
    endDate: isoDate,
    durationDays: z.number().int().positive().optional(),
    pricePerPerson: z.number().nonnegative(),
    totalSeats: z.number().int().positive(),
    seatsRemaining: z.number().int().nonnegative().optional(),
    description: z.string().trim().max(5000).optional(),
    itinerary: z.array(itineraryDay).default([]),
    coverPhotoUrl: z.string().url(),
    galleryUrls: z.array(z.string().url()).default([]),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: 'endDate must be on or after startDate',
    path: ['endDate'],
  });

// All fields optional on update; status transitions allowed.
const updateTripSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  category: z.string().trim().min(1).optional(),
  destination: destination.optional(),
  startDate: isoDate.optional(),
  endDate: isoDate.optional(),
  durationDays: z.number().int().positive().optional(),
  pricePerPerson: z.number().nonnegative().optional(),
  totalSeats: z.number().int().positive().optional(),
  seatsRemaining: z.number().int().nonnegative().optional(),
  description: z.string().trim().max(5000).optional(),
  itinerary: z.array(itineraryDay).optional(),
  coverPhotoUrl: z.string().url().optional(),
  galleryUrls: z.array(z.string().url()).optional(),
  status: z.enum(['live', 'paused', 'deleted', 'past']).optional(),
});

const listTripsQuerySchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(['live', 'paused', 'deleted', 'past']).optional(),
  posterId: z.string().trim().optional(),
  // "popular near you": lng,lat + radius (km)
  near: z.string().trim().optional(),
  radiusKm: z.coerce.number().positive().max(500).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  sort: z.enum(['recent', 'departing', 'priceAsc', 'priceDesc']).default('recent'),
});

module.exports = {
  createTripSchema,
  updateTripSchema,
  listTripsQuerySchema,
};
