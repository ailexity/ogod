'use strict';

const asyncHandler = require('../utils/asyncHandler');
const { ok, created } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const Category = require('../models/Category');

/** GET /api/categories  (public) — active categories for chips/tiles. */
const listCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'admin' && req.query.all === 'true';
  const filter = includeInactive ? {} : { active: true };
  const categories = await Category.find(filter).sort({ sortOrder: 1, label: 1 }).lean();
  return ok(res, { categories });
});

/** POST /api/categories  (admin) */
const createCategory = asyncHandler(async (req, res) => {
  const exists = await Category.findOne({ slug: req.body.slug });
  if (exists) throw ApiError.conflict(`Category "${req.body.slug}" already exists`);
  const category = await Category.create(req.body);
  return created(res, { category });
});

/** PATCH /api/categories/:slug  (admin) */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOneAndUpdate(
    { slug: req.params.slug.toLowerCase() },
    req.body,
    { new: true, runValidators: true }
  );
  if (!category) throw ApiError.notFound('Category not found');
  return ok(res, { category });
});

module.exports = { listCategories, createCategory, updateCategory };
