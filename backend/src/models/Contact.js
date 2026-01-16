/**
 * Contact Model
 * Represents a contact that can be synced between local DB and HubSpot
 */
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    // Basic contact information
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    company: {
        type: String,
        trim: true,
        default: ''
    },

    // HubSpot sync fields
    externalId: {
        type: String,
        default: null  // HubSpot contact ID, null if not yet synced
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    syncStatus: {
        type: String,
        enum: ['pending', 'synced', 'failed'],
        default: 'pending'
    },
    retryCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Contact', contactSchema);
