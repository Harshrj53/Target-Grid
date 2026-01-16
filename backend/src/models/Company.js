/**
 * Company Model
 * Represents a company that can be synced between local DB and HubSpot
 */
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    // Basic company information
    name: {
        type: String,
        required: true,
        trim: true
    },
    domain: {
        type: String,
        trim: true,
        default: ''
    },
    industry: {
        type: String,
        trim: true,
        default: ''
    },

    // HubSpot sync fields
    externalId: {
        type: String,
        default: null  // HubSpot company ID, null if not yet synced
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    syncStatus: {
        type: String,
        enum: ['pending', 'synced', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
