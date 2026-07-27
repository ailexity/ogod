'use strict';

const express = require('express');
const controller = require('../controllers/uploadController');
const { requireAuth } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Posters upload trip media; compressed + pushed to S3 in the controller.
router.post('/image', requireAuth, requireRole('poster', 'admin'), upload.single('file'), controller.uploadSingle);

router.post('/images', requireAuth, requireRole('poster', 'admin'), upload.array('files', 12), controller.uploadMany);

module.exports = router;
