/**
 * Sync Routes
 * Endpoints for triggering and monitoring sync
 */
const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

// POST /api/sync/run - Trigger a manual sync
router.post('/run', syncController.runSync);

// GET /api/sync/status - Get current sync status
router.get('/status', syncController.getSyncStatus);

module.exports = router;
