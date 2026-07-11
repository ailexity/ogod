'use strict';

const { z } = require('zod');

// Public inquiry form — traveler is anonymous.
const createLeadSchema = z.object({
  tripId: z.string().trim().min(1),
  travelerName: z.string().trim().min(1).max(120),
  travelerMobile: z
    .string()
    .trim()
    .min(10, 'Mobile number looks too short')
    .max(20),
  destinationInterest: z.string().trim().max(200).optional(),
  requirements: z.string().trim().max(1000).optional(),
});

// Admin lead listing / export filters.
const listLeadsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  destination: z.string().trim().optional(),
  category: z.string().trim().optional(),
  tripId: z.string().trim().optional(),
  posterId: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
});

module.exports = { createLeadSchema, listLeadsQuerySchema };
