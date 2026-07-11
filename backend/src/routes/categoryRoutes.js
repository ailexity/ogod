'use strict';

const express = require('express');
const controller = require('../controllers/categoryController');
const validate = require('../middleware/validate');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  createCategorySchema,
  updateCategorySchema,
} = require('../validators/categoryValidators');

const router = express.Router();

router.get('/', optionalAuth, controller.listCategories);
router.post('/', requireAuth, requireRole('admin'), validate(createCategorySchema), controller.createCategory);
router.patch('/:slug', requireAuth, requireRole('admin'), validate(updateCategorySchema), controller.updateCategory);

module.exports = router;
