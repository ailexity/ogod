'use strict';

const express = require('express');
const controller = require('../controllers/leadController');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { createLeadSchema, listLeadsQuerySchema } = require('../validators/leadValidators');

const router = express.Router();

// ---- Public: traveler submits an inquiry ----
router.post('/', validate(createLeadSchema), controller.createLead);

// ---- Poster: leads for own trips ----
router.get('/mine', requireAuth, requireRole('poster', 'admin'), controller.myLeads);

// ---- Admin: full lead dashboard + CSV export ----
router.get('/', requireAuth, requireRole('admin'), validate(listLeadsQuerySchema, 'query'), controller.listLeads);
router.get('/export', requireAuth, requireRole('admin'), validate(listLeadsQuerySchema, 'query'), controller.exportLeads);

module.exports = router;
