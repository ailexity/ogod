'use strict';

const express = require('express');
const controller = require('../controllers/tripController');
const validate = require('../middleware/validate');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  createTripSchema,
  updateTripSchema,
  listTripsQuerySchema,
} = require('../validators/tripValidators');

const router = express.Router();

// ---- Public browse/search ----
router.get('/', validate(listTripsQuerySchema, 'query'), controller.listTrips);
router.get('/shelves', controller.homeShelves);

// ---- Poster-owned (must come before "/:id" to avoid capture) ----
router.get('/mine', requireAuth, requireRole('poster', 'admin'), controller.myListings);

router.post(
  '/',
  requireAuth,
  requireRole('poster', 'admin'),
  validate(createTripSchema),
  controller.createTrip
);

router.get('/:id', optionalAuth, controller.getTrip);

router.patch('/:id', requireAuth, validate(updateTripSchema), controller.updateTrip);
router.post('/:id/pause', requireAuth, controller.pauseTrip);
router.post('/:id/resume', requireAuth, controller.resumeTrip);
router.delete('/:id', requireAuth, controller.deleteTrip);

module.exports = router;
