/**
 * Sync Controller
 * Handles sync-related API endpoints
 */
const syncService = require('../services/syncService');

/**
 * Trigger a manual sync
 * POST /api/sync/run
 */
const runSync = async (req, res) => {
    try {
        const result = await syncService.runFullSync();
        res.json(result);
    } catch (error) {
        console.error('Error running sync:', error.message);
        res.status(500).json({ error: 'Failed to run sync' });
    }
};

/**
 * Get current sync status
 * GET /api/sync/status
 */
const getSyncStatus = async (req, res) => {
    try {
        const status = await syncService.getSyncStatus();
        res.json({ status });
    } catch (error) {
        console.error('Error getting sync status:', error.message);
        res.status(500).json({ error: 'Failed to get sync status' });
    }
};

module.exports = {
    runSync,
    getSyncStatus
};
