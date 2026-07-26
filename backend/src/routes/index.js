'use strict';

const express = require('express');

const authRoutes = require('./authRoutes');
const tripRoutes = require('./tripRoutes');
const leadRoutes = require('./leadRoutes');
const categoryRoutes = require('./categoryRoutes');
const uploadRoutes = require('./uploadRoutes');
const mapsRoutes = require('./MapsRoutes');

const router = express.Router();

router.get('/', (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Ogod Backend API Running",
        data: {
            name: "Ogod API",
            version: "1.0.0",
            phase: "Phase 1 (MVP)",
            docs: "/api/health"
        }
    });
});

router.use('/auth', authRoutes);
router.use('/trips', tripRoutes);
router.use('/leads', leadRoutes);
router.use('/categories', categoryRoutes);
router.use('/uploads', uploadRoutes);
router.use('/maps', mapsRoutes);

module.exports = router;
