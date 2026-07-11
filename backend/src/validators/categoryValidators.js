'use strict';

const { z } = require('zod');

const createCategorySchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'slug may contain lowercase letters, numbers and hyphens only'),
  label: z.string().trim().min(1),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

const updateCategorySchema = z.object({
  label: z.string().trim().min(1).optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

module.exports = { createCategorySchema, updateCategorySchema };
