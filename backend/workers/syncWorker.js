const syncQueue = require('../queues/syncQueue');
const Contact = require('../models/Contact');
const Conflict = require('../models/Conflict');
const hubspotService = require('../services/hubspotService');

// Worker Process
syncQueue.process(async (job) => {
    const { trigger, contactId, hubspotContact } = job.data;
    console.log(`Processing sync job: ${trigger}`);

    try {
        if (trigger === 'local_update') {
            await handleLocalUpdate(contactId);
        } else if (trigger === 'hubspot_webhook') {
            await handleHubSpotWebhook(hubspotContact);
        }
    } catch (error) {
        console.error('Sync Job Failed:', error.message);
        throw error; // Allows Bull to retry
    }
});

// Case 1: Local Data Updated -> Push to HubSpot
async function handleLocalUpdate(contactId) {
    const localContact = await Contact.findById(contactId);
    if (!localContact) return;

    // Check if exists in HubSpot
    const hsContact = await hubspotService.getContactByEmail(localContact.email);

    if (hsContact) {
        const hsLastModified = new Date(hsContact.updatedAt); // ISO string from HubSpot

        // Conflict Detection: If HubSpot was updated AFTER our local update (or reasonably close/newer)
        // Simplification: If HS is newer than Local, it's a conflict.
        if (hsLastModified > localContact.lastModified) {
            console.log('Conflict detected: HubSpot has newer data.');
            await ensureConflictRecord(localContact.email, localContact.toObject(), hsContact);
            return;
        }

        // No conflict: Update HubSpot
        await hubspotService.updateContact(hsContact.id, localContact);
    } else {
        // Create in HubSpot
        const result = await hubspotService.createContact(localContact);
        // Save HubSpot ID to local
        localContact.hubspotId = result.id;
        await localContact.save();
    }
}

// Case 2: HubSpot Data Updated -> Push to Local
async function handleHubSpotWebhook(hsData) {
    const email = hsData.properties.email;
    if (!email) return;

    let localContact = await Contact.findOne({ email });
    const hsLastModified = new Date(hsData.updatedAt || new Date());

    if (localContact) {
        // Conflict Detection: If Local is newer than HubSpot
        if (localContact.lastModified > hsLastModified) {
            console.log('Conflict detected: Local has newer data.');
            await ensureConflictRecord(email, localContact.toObject(), hsData);
            return;
        }

        // No conflict: Update Local
        localContact.firstName = hsData.properties.firstname;
        localContact.lastName = hsData.properties.lastname;
        localContact.phone = hsData.properties.phone;
        localContact.hubspotId = hsData.id;
        // Prevent update loop by checking equality or using flag? 
        // We will trust the timestamps to eventually settle.
        await localContact.save();
    } else {
        // Create Local
        await Contact.create({
            email,
            firstName: hsData.properties.firstname,
            lastName: hsData.properties.lastname,
            phone: hsData.properties.phone,
            hubspotId: hsData.id
        });
    }
}

async function ensureConflictRecord(email, localData, hubspotData) {
    // Check if pending conflict already exists
    const existing = await Conflict.findOne({ email, status: 'pending_manual_resolution' });
    if (!existing) {
        await Conflict.create({
            contactEmail: email,
            localData,
            hubspotData
        });
    }
}
