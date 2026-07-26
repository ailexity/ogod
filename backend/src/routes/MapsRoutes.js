'use strict';

const express = require('express');

const router = express.Router();

const mapsController = require('../controllers/mapsController');
const { requireAuth } = require('../middleware/auth');

// Geocode a destination
router.get(
    '/geocode',
    requireAuth,
    mapsController.geocode
);

module.exports = router;
