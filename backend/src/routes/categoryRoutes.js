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

router.get('/', controller.listCategories);
router.get
(
    '/:slug',
    optionalAuth,
    controller.getCategory
);

router.post('/', requireAuth, requireRole('admin'), validate(createCategorySchema), controller.createCategory);
router.patch('/:slug', requireAuth, requireRole('admin'), validate(updateCategorySchema), controller.updateCategory);
router.delete
  (
    '/:slug',
    requireAuth,
    requireRole('admin'),
    controller.deleteCategory
  );

module.exports = router;
