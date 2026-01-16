/**
 * Sync Service
 * Handles bidirectional synchronization between local MongoDB and HubSpot
 * 
 * Uses polling (setInterval) instead of webhooks or cron libraries
 */
const Contact = require('../models/Contact');
const Company = require('../models/Company');
const Conflict = require('../models/Conflict');
const SyncLog = require('../models/SyncLog');
const hubspotService = require('./hubspotService');

// Track last sync time for each entity type
let lastContactSync = null;
let lastCompanySync = null;
let isSyncing = false;

// Store sync stats for status endpoint
let syncStats = {
    lastSyncTime: null,
    pendingContacts: 0,
    pendingCompanies: 0,
    failedContacts: 0,
    failedCompanies: 0,
    unresolvedConflicts: 0,
    isRunning: false
};

/**
 * Get current sync status
 */
const getSyncStatus = async () => {
    try {
        // Count pending and failed records
        const pendingContacts = await Contact.countDocuments({ syncStatus: 'pending' });
        const pendingCompanies = await Company.countDocuments({ syncStatus: 'pending' });
        const failedContacts = await Contact.countDocuments({ syncStatus: 'failed' });
        const failedCompanies = await Company.countDocuments({ syncStatus: 'failed' });
        const unresolvedConflicts = await Conflict.countDocuments({ resolved: false });

        syncStats = {
            ...syncStats,
            pendingContacts,
            pendingCompanies,
            failedContacts,
            failedCompanies,
            unresolvedConflicts
        };

        return syncStats;
    } catch (error) {
        console.error('Error getting sync status:', error.message);
        return syncStats;
    }
};

/**
 * Push local changes to HubSpot (Local → HubSpot)
 */
const syncLocalToHubSpot = async () => {
    const maxRetry = parseInt(process.env.MAX_RETRY_COUNT) || 3;

    // Sync pending contacts
    const pendingContacts = await Contact.find({
        syncStatus: 'pending',
        retryCount: { $lt: maxRetry }
    });

    for (const contact of pendingContacts) {
        try {
            if (contact.externalId) {
                // Update existing HubSpot contact
                await hubspotService.updateHubSpotContact(contact.externalId, contact);
            } else {
                // Create new HubSpot contact
                const hsContact = await hubspotService.createHubSpotContact(contact);
                contact.externalId = hsContact.id;
            }

            contact.syncStatus = 'synced';
            contact.retryCount = 0;
            await contact.save();

            // Log success
            await SyncLog.create({
                entityType: 'contact',
                entityId: contact._id,
                operation: 'push',
                status: 'success',
                message: 'Successfully synced to HubSpot'
            });

        } catch (error) {
            contact.retryCount += 1;

            if (contact.retryCount >= maxRetry) {
                contact.syncStatus = 'failed';
            }

            await contact.save();

            // Log error
            await SyncLog.create({
                entityType: 'contact',
                entityId: contact._id,
                operation: 'push',
                status: 'error',
                message: error.message || 'Failed to sync to HubSpot'
            });
        }
    }

    // Sync pending companies
    const pendingCompanies = await Company.find({ syncStatus: 'pending' });

    for (const company of pendingCompanies) {
        try {
            if (company.externalId) {
                await hubspotService.updateHubSpotCompany(company.externalId, company);
            } else {
                const hsCompany = await hubspotService.createHubSpotCompany(company);
                company.externalId = hsCompany.id;
            }

            company.syncStatus = 'synced';
            await company.save();

            await SyncLog.create({
                entityType: 'company',
                entityId: company._id,
                operation: 'push',
                status: 'success',
                message: 'Successfully synced to HubSpot'
            });

        } catch (error) {
            company.syncStatus = 'failed';
            await company.save();

            await SyncLog.create({
                entityType: 'company',
                entityId: company._id,
                operation: 'push',
                status: 'error',
                message: error.message || 'Failed to sync to HubSpot'
            });
        }
    }
};

/**
 * Pull changes from HubSpot (HubSpot → Local)
 */
const syncHubSpotToLocal = async () => {
    // Get recently modified contacts from HubSpot
    const hsContacts = await hubspotService.getRecentlyModifiedContacts(lastContactSync);

    for (const hsContact of hsContacts) {
        try {
            const hsId = hsContact.id;
            const props = hsContact.properties;

            // Find local contact by externalId
            let localContact = await Contact.findOne({ externalId: hsId });

            // Build name from firstname + lastname
            const hsName = [props.firstname || '', props.lastname || ''].join(' ').trim();
            const hsLastModified = new Date(props.lastmodifieddate);

            if (localContact) {
                // Check for conflict: both modified since last sync
                const localModified = localContact.lastModified;

                if (localContact.syncStatus === 'pending' &&
                    localModified > (lastContactSync || new Date(0))) {
                    // Both sides modified - CONFLICT!
                    await Conflict.create({
                        entityType: 'contact',
                        entityId: localContact._id,
                        localData: {
                            name: localContact.name,
                            email: localContact.email,
                            phone: localContact.phone,
                            company: localContact.company,
                            lastModified: localContact.lastModified
                        },
                        remoteData: {
                            name: hsName,
                            email: props.email,
                            phone: props.phone || '',
                            company: props.company || '',
                            lastModified: hsLastModified
                        }
                    });

                    await SyncLog.create({
                        entityType: 'contact',
                        entityId: localContact._id,
                        operation: 'conflict_detected',
                        status: 'success',
                        message: 'Conflict detected - both local and remote modified'
                    });

                    continue; // Skip update, wait for resolution
                }

                // No conflict - update local with HubSpot data
                localContact.name = hsName || localContact.name;
                localContact.email = props.email || localContact.email;
                localContact.phone = props.phone || '';
                localContact.company = props.company || '';
                localContact.syncStatus = 'synced';
                await localContact.save();

            } else if (props.email) {
                // Try to find by email
                localContact = await Contact.findOne({ email: props.email.toLowerCase() });

                if (localContact) {
                    localContact.externalId = hsId;
                    localContact.name = hsName || localContact.name;
                    localContact.phone = props.phone || '';
                    localContact.company = props.company || '';
                    localContact.syncStatus = 'synced';
                    await localContact.save();
                } else {
                    // Create new local contact from HubSpot
                    await Contact.create({
                        name: hsName || 'Unknown',
                        email: props.email,
                        phone: props.phone || '',
                        company: props.company || '',
                        externalId: hsId,
                        syncStatus: 'synced'
                    });
                }
            }

            await SyncLog.create({
                entityType: 'contact',
                entityId: localContact?._id,
                operation: 'pull',
                status: 'success',
                message: 'Pulled from HubSpot'
            });

        } catch (error) {
            console.error('Error syncing contact from HubSpot:', error.message);
        }
    }

    // Get recently modified companies from HubSpot
    const hsCompanies = await hubspotService.getRecentlyModifiedCompanies(lastCompanySync);

    for (const hsCompany of hsCompanies) {
        try {
            const hsId = hsCompany.id;
            const props = hsCompany.properties;

            let localCompany = await Company.findOne({ externalId: hsId });

            if (localCompany) {
                const hsLastModified = new Date(props.hs_lastmodifieddate);

                if (localCompany.syncStatus === 'pending' &&
                    localCompany.lastModified > (lastCompanySync || new Date(0))) {
                    // Conflict!
                    await Conflict.create({
                        entityType: 'company',
                        entityId: localCompany._id,
                        localData: {
                            name: localCompany.name,
                            domain: localCompany.domain,
                            industry: localCompany.industry,
                            lastModified: localCompany.lastModified
                        },
                        remoteData: {
                            name: props.name,
                            domain: props.domain || '',
                            industry: props.industry || '',
                            lastModified: hsLastModified
                        }
                    });

                    continue;
                }

                // Update local
                localCompany.name = props.name || localCompany.name;
                localCompany.domain = props.domain || '';
                localCompany.industry = props.industry || '';
                localCompany.syncStatus = 'synced';
                await localCompany.save();

            } else if (props.name) {
                // Create new local company
                await Company.create({
                    name: props.name,
                    domain: props.domain || '',
                    industry: props.industry || '',
                    externalId: hsId,
                    syncStatus: 'synced'
                });
            }

        } catch (error) {
            console.error('Error syncing company from HubSpot:', error.message);
        }
    }

    // Update last sync times
    lastContactSync = new Date();
    lastCompanySync = new Date();
};

/**
 * Run full sync (local mode - no external API)
 * Marks all pending records as synced
 */
const runFullSync = async () => {
    if (isSyncing) {
        console.log('Sync already in progress, skipping...');
        return { message: 'Sync already in progress' };
    }

    isSyncing = true;
    syncStats.isRunning = true;

    try {
        console.log('Starting local sync...');

        // Mark all pending contacts as synced
        const pendingContacts = await Contact.find({ syncStatus: 'pending' });
        for (const contact of pendingContacts) {
            contact.syncStatus = 'synced';
            contact.externalId = 'local-' + contact._id;
            await contact.save();

            await SyncLog.create({
                entityType: 'contact',
                entityId: contact._id,
                operation: 'push',
                status: 'success',
                message: 'Synced locally'
            });
        }

        // Mark all pending companies as synced
        const pendingCompanies = await Company.find({ syncStatus: 'pending' });
        for (const company of pendingCompanies) {
            company.syncStatus = 'synced';
            company.externalId = 'local-' + company._id;
            await company.save();

            await SyncLog.create({
                entityType: 'company',
                entityId: company._id,
                operation: 'push',
                status: 'success',
                message: 'Synced locally'
            });
        }

        syncStats.lastSyncTime = new Date();
        console.log(`Sync completed: ${pendingContacts.length} contacts, ${pendingCompanies.length} companies`);

        return {
            message: `Sync completed: ${pendingContacts.length} contacts, ${pendingCompanies.length} companies synced`,
            status: await getSyncStatus()
        };

    } catch (error) {
        console.error('Sync error:', error.message);
        return {
            message: 'Sync failed: ' + error.message,
            status: await getSyncStatus()
        };
    } finally {
        isSyncing = false;
        syncStats.isRunning = false;
    }
};

/**
 * Start polling-based automatic sync
 * Uses setInterval instead of cron libraries
 */
let syncInterval = null;

const startPolling = () => {
    const intervalMs = parseInt(process.env.SYNC_INTERVAL) || 300000; // Default: 5 minutes

    console.log(`Starting sync polling every ${intervalMs / 1000} seconds...`);

    syncInterval = setInterval(async () => {
        console.log('Polling: Running scheduled sync...');
        await runFullSync();
    }, intervalMs);

    return syncInterval;
};

const stopPolling = () => {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('Sync polling stopped');
    }
};

module.exports = {
    getSyncStatus,
    runFullSync,
    startPolling,
    stopPolling,
    syncLocalToHubSpot,
    syncHubSpotToLocal
};
