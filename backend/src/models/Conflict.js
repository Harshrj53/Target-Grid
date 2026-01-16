/**
 * Conflict Model
 * Stores conflicts detected when both local and remote records are modified
 */
const mongoose = require('mongoose');

const conflictSchema = new mongoose.Schema({
    // Type of entity (contact or company)
    entityType: {
        type: String,
        enum: ['contact', 'company'],
        required: true
    },

    // Reference to the local entity
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    // Snapshots of conflicting data
    localData: {
        type: Object,
        required: true
    },
    remoteData: {
        type: Object,
        required: true
    },

    // Conflict metadata
    detectedAt: {
        type: Date,
        default: Date.now
    },
    resolved: {
        type: Boolean,
        default: false
    },
    resolvedBy: {
        type: String,
        enum: ['local', 'remote', 'merge', null],
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Conflict', conflictSchema);
