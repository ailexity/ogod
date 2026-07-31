'use strict';

const { z } = require('zod');

// Public inquiry form — traveler is anonymous.
const createLeadSchema = z.object({
  tripId: z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid Trip ID"),
  travelerName: z.string().trim().min(1).max(120),
  travelerMobile: z
  .string()
  .trim()
  .regex(
    /^[0-9]{10,15}$/,
    "Mobile number must contain 10 to 15 digits"
  ),
  destinationInterest: z.string().trim().max(200).optional(),
  requirements: z.string().trim().max(1000).optional(),
}).strict();

// Admin lead listing / export filters.
const listLeadsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  destination: z.string().trim().optional(),
  category: z.string().trim().optional(),
  tripId: z
  .string()
  .trim()
  .regex(
    /^[a-fA-F0-9]{24}$/,
    "Invalid Trip ID"
  )
  .optional(),
  posterId: z
  .string()
  .trim()
  .regex(
    /^[a-fA-F0-9]{24}$/,
    "Invalid Poster ID"
  )
  .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
}).refine(
  (data) => !data.from || !data.to || data.from <= data.to,
  {
    message: "From date cannot be after To date",
    path: ["from"],
  }
);

module.exports = { createLeadSchema, listLeadsQuerySchema };
