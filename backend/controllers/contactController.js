const Contact = require('../models/Contact');
const Conflict = require('../models/Conflict');
const syncQueue = require('../queues/syncQueue');

// Get all contacts
exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ lastModified: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new contact
exports.createContact = async (req, res) => {
    try {
        const contact = new Contact(req.body);
        await contact.save();

        // Trigger Sync
        syncQueue.add({ trigger: 'local_update', contactId: contact._id });

        res.status(201).json(contact);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update contact
exports.updateContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!contact) return res.status(404).json({ error: 'Contact not found' });

        // Trigger Sync
        syncQueue.add({ trigger: 'local_update', contactId: contact._id });

        res.json(contact);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get Dashboard Stats
exports.getStats = async (req, res) => {
    try {
        const totalContacts = await Contact.countDocuments();
        const pendingConflicts = await Conflict.countDocuments({ status: 'pending_manual_resolution' });
        // Simulating sync stats (in real app, use redis or job logs)
        const failedSyncs = await syncQueue.getFailedCount();

        res.json({
            totalContacts,
            pendingConflicts,
            failedSyncs
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Conflicts
exports.getConflicts = async (req, res) => {
    try {
        const conflicts = await Conflict.find({ status: 'pending_manual_resolution' });
        res.json(conflicts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Resolve Conflict
exports.resolveConflict = async (req, res) => {
    const { conflictId, resolutionVersion } = req.body; // 'local' or 'hubspot'

    try {
        const conflict = await Conflict.findById(conflictId);
        if (!conflict) return res.status(404).json({ error: 'Conflict not found' });

        const email = conflict.contactEmail;

        if (resolutionVersion === 'local') {
            // Keep Local: Force push to HubSpot
            // We can just rely on normal sync logic but we might need to force the timestamp or logic
            // Easiest: Just re-trigger local_update sync. 
            // The worker logic handles "Newer wins". 
            // BUT here we made a manual decision.
            // We should arguably update the 'Winner' to have NOW() as timestamp so it propagates.

            await Contact.updateOne({ email }, { ...conflict.localData, lastModified: new Date() });
            const contact = await Contact.findOne({ email });
            syncQueue.add({ trigger: 'local_update', contactId: contact._id });

        } else if (resolutionVersion === 'hubspot') {
            // Keep HubSpot: local update to match HS
            const hsData = conflict.hubspotData;
            await Contact.updateOne({ email }, {
                firstName: hsData.properties.firstname,
                lastName: hsData.properties.lastname,
                phone: hsData.properties.phone,
                lastModified: new Date()
            });
            // We don't push back to HS because HS is already the source of truth
        }

        conflict.status = 'resolved';
        await conflict.save();

        res.json({ message: 'Conflict resolved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
