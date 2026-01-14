const mongoose = require('mongoose');

const ConflictSchema = new mongoose.Schema({
    contactEmail: {
        type: String,
        required: true
    },
    localData: {
        type: Object,
        required: true
    },
    hubspotData: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        enum: ['pending_manual_resolution', 'resolved'],
        default: 'pending_manual_resolution'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Conflict', ConflictSchema);
