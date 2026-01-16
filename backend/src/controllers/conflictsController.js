/**
 * Conflicts Controller
 * Handles conflict listing and resolution
 */
const Conflict = require('../models/Conflict');
const Contact = require('../models/Contact');
const Company = require('../models/Company');
const SyncLog = require('../models/SyncLog');

/**
 * Get all unresolved conflicts
 * GET /api/conflicts
 */
const getAllConflicts = async (req, res) => {
    try {
        // Get query params for filtering
        const { resolved } = req.query;

        let filter = {};
        if (resolved === 'true') {
            filter.resolved = true;
        } else if (resolved === 'false') {
            filter.resolved = false;
        }
        // If no filter, return all conflicts

        const conflicts = await Conflict.find(filter).sort({ detectedAt: -1 });

        res.json({ conflicts });
    } catch (error) {
        console.error('Error fetching conflicts:', error.message);
        res.status(500).json({ error: 'Failed to fetch conflicts' });
    }
};

/**
 * Resolve a conflict
 * POST /api/conflicts/resolve
 * 
 * Body: { conflictId, resolution: 'local' | 'remote' }
 * - local: Keep local data, push to HubSpot
 * - remote: Keep HubSpot data, update local
 */
const resolveConflict = async (req, res) => {
    try {
        const { conflictId, resolution } = req.body;

        // Manual validation
        if (!conflictId) {
            return res.status(400).json({ error: 'conflictId is required' });
        }
        if (!resolution || !['local', 'remote'].includes(resolution)) {
            return res.status(400).json({ error: 'resolution must be "local" or "remote"' });
        }

        // Find the conflict
        const conflict = await Conflict.findById(conflictId);
        if (!conflict) {
            return res.status(404).json({ error: 'Conflict not found' });
        }

        if (conflict.resolved) {
            return res.status(400).json({ error: 'Conflict already resolved' });
        }

        // Get the model based on entity type
        const Model = conflict.entityType === 'contact' ? Contact : Company;

        // Find the entity
        const entity = await Model.findById(conflict.entityId);
        if (!entity) {
            return res.status(404).json({ error: `${conflict.entityType} not found` });
        }

        if (resolution === 'remote') {
            // Apply remote (HubSpot) data to local entity
            const remoteData = conflict.remoteData;

            if (conflict.entityType === 'contact') {
                if (remoteData.name) entity.name = remoteData.name;
                if (remoteData.email) entity.email = remoteData.email;
                if (remoteData.phone !== undefined) entity.phone = remoteData.phone;
                if (remoteData.company !== undefined) entity.company = remoteData.company;
            } else {
                if (remoteData.name) entity.name = remoteData.name;
                if (remoteData.domain !== undefined) entity.domain = remoteData.domain;
                if (remoteData.industry !== undefined) entity.industry = remoteData.industry;
            }

            entity.syncStatus = 'synced';
            await entity.save();
        } else {
            // Keep local data - mark as pending to push to HubSpot
            entity.syncStatus = 'pending';
            await entity.save();
        }

        // Mark conflict as resolved
        conflict.resolved = true;
        conflict.resolvedBy = resolution;
        conflict.resolvedAt = new Date();
        await conflict.save();

        // Log the resolution
        await SyncLog.create({
            entityType: conflict.entityType,
            entityId: conflict.entityId,
            operation: 'conflict_resolved',
            status: 'success',
            message: `Conflict resolved by keeping ${resolution} data`
        });

        res.json({
            message: 'Conflict resolved successfully',
            conflict,
            entity
        });
    } catch (error) {
        console.error('Error resolving conflict:', error.message);
        res.status(500).json({ error: 'Failed to resolve conflict' });
    }
};

module.exports = {
    getAllConflicts,
    resolveConflict
};
