const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    firstName: String,
    lastName: String,
    phone: String,
    hubspotId: {
        type: String,
        default: null
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Update lastModified on save
ContactSchema.pre('save', function (next) {
    this.lastModified = new Date();
    next();
});

module.exports = mongoose.model('Contact', ContactSchema);
