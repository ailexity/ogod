'use strict';

const { z } = require('zod');

const createCategorySchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'slug may contain lowercase letters, numbers and hyphens only'),
  label: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300).optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
}).strict();

const updateCategorySchema = z.object({
  label: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(300).optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
}).strict();

module.exports = { createCategorySchema, updateCategorySchema };
