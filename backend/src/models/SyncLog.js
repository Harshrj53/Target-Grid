/**
 * SyncLog Model
 * Logs all sync operations for debugging and monitoring
 */
const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
    // Entity information
    entityType: {
        type: String,
        enum: ['contact', 'company'],
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    // Sync operation details
    operation: {
        type: String,
        enum: ['push', 'pull', 'conflict_detected', 'conflict_resolved'],
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'error'],
        required: true
    },
    message: {
        type: String,
        default: ''
    },

    // Timing
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SyncLog', syncLogSchema);
