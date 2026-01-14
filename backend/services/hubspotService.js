const hubspotRequest = require('../utils/hubspotClient');

// Map local fields to HubSpot properties
const toHubSpotFormat = (contact) => {
    return {
        properties: {
            email: contact.email,
            firstname: contact.firstName,
            lastname: contact.lastName,
            phone: contact.phone
        }
    };
};

const getContactByEmail = async (email) => {
    try {
        // Search endpoint
        const response = await hubspotRequest('POST', '/search', {
            filterGroups: [{
                filters: [{
                    propertyName: 'email',
                    operator: 'EQ',
                    value: email
                }]
            }]
        });

        return response.results.length > 0 ? response.results[0] : null;
    } catch (error) {
        console.error('Error fetching from HubSpot:', error.message);
        throw error;
    }
};

const createContact = async (contact) => {
    try {
        const payload = toHubSpotFormat(contact);
        return await hubspotRequest('POST', '/', payload);
    } catch (error) {
        console.error('Error creating in HubSpot:', error.message);
        throw error;
    }
};

const updateContact = async (hubspotId, contact) => {
    try {
        const payload = toHubSpotFormat(contact);
        return await hubspotRequest('PATCH', `/${hubspotId}`, payload);
    } catch (error) {
        console.error('Error updating in HubSpot:', error.message);
        throw error;
    }
};

module.exports = {
    getContactByEmail,
    createContact,
    updateContact
};
