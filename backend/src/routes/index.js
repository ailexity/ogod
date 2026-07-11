'use strict';

const express = require('express');

const authRoutes = require('./authRoutes');
const tripRoutes = require('./tripRoutes');
const leadRoutes = require('./leadRoutes');
const categoryRoutes = require('./categoryRoutes');
const uploadRoutes = require('./uploadRoutes');

const router = express.Router();

router.get('/', (_req, res) =>
  res.json({
    success: true,
    data: {
      name: 'Ogod API',
      version: '1.0.0',
      phase: 'Phase 1 (MVP)',
      docs: '/api/health',
    },
  })
);

router.use('/auth', authRoutes);
router.use('/trips', tripRoutes);
router.use('/leads', leadRoutes);
router.use('/categories', categoryRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
