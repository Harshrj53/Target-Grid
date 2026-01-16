/**
 * Conflicts Routes
 * Endpoints for viewing and resolving conflicts
 */
const express = require('express');
const router = express.Router();
const conflictsController = require('../controllers/conflictsController');

// GET /api/conflicts - Get all conflicts
router.get('/', conflictsController.getAllConflicts);

// POST /api/conflicts/resolve - Resolve a conflict
router.post('/resolve', conflictsController.resolveConflict);

module.exports = router;
