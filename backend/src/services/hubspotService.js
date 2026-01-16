/**
 * HubSpot Service
 * Handles all API calls to HubSpot CRM using Axios
 * 
 * Note: This service makes real API calls to HubSpot.
 * You need a valid HUBSPOT_ACCESS_TOKEN in your .env file.
 */
const axios = require('axios');

// HubSpot API base URL
const HUBSPOT_BASE_URL = 'https://api.hubapi.com';

// Create axios instance with default config
const hubspotApi = axios.create({
    baseURL: HUBSPOT_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to every request
hubspotApi.interceptors.request.use((config) => {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    if (token && token !== 'your_hubspot_access_token_here') {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* ========================================
   CONTACT OPERATIONS
   ======================================== */

/**
 * Create a contact in HubSpot
 * @param {Object} contactData - { email, firstname, lastname, phone, company }
 * @returns {Object} - Created HubSpot contact
 */
const createHubSpotContact = async (contactData) => {
    try {
        // Map our fields to HubSpot properties
        const properties = {
            email: contactData.email,
            firstname: contactData.name ? contactData.name.split(' ')[0] : '',
            lastname: contactData.name ? contactData.name.split(' ').slice(1).join(' ') : '',
            phone: contactData.phone || '',
            company: contactData.company || ''
        };

        const response = await hubspotApi.post('/crm/v3/objects/contacts', {
            properties
        });

        return response.data;
    } catch (error) {
        console.error('HubSpot createContact error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Update a contact in HubSpot
 * @param {string} hubspotId - HubSpot contact ID
 * @param {Object} contactData - Updated contact data
 * @returns {Object} - Updated HubSpot contact
 */
const updateHubSpotContact = async (hubspotId, contactData) => {
    try {
        const properties = {};

        if (contactData.name) {
            properties.firstname = contactData.name.split(' ')[0];
            properties.lastname = contactData.name.split(' ').slice(1).join(' ');
        }
        if (contactData.email) properties.email = contactData.email;
        if (contactData.phone !== undefined) properties.phone = contactData.phone;
        if (contactData.company !== undefined) properties.company = contactData.company;

        const response = await hubspotApi.patch(`/crm/v3/objects/contacts/${hubspotId}`, {
            properties
        });

        return response.data;
    } catch (error) {
        console.error('HubSpot updateContact error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get recently modified contacts from HubSpot
 * @param {Date} since - Get contacts modified after this date
 * @returns {Array} - Array of HubSpot contacts
 */
const getRecentlyModifiedContacts = async (since = null) => {
    try {
        // Use search API to find recently modified contacts
        const filters = [];

        if (since) {
            filters.push({
                propertyName: 'lastmodifieddate',
                operator: 'GTE',
                value: since.getTime()
            });
        }

        const response = await hubspotApi.post('/crm/v3/objects/contacts/search', {
            filterGroups: filters.length > 0 ? [{ filters }] : [],
            properties: ['email', 'firstname', 'lastname', 'phone', 'company', 'lastmodifieddate'],
            limit: 100
        });

        return response.data.results || [];
    } catch (error) {
        console.error('HubSpot getRecentContacts error:', error.response?.data || error.message);
        throw error;
    }
};

/* ========================================
   COMPANY OPERATIONS
   ======================================== */

/**
 * Create a company in HubSpot
 * @param {Object} companyData - { name, domain, industry }
 * @returns {Object} - Created HubSpot company
 */
const createHubSpotCompany = async (companyData) => {
    try {
        const properties = {
            name: companyData.name,
            domain: companyData.domain || '',
            industry: companyData.industry || ''
        };

        const response = await hubspotApi.post('/crm/v3/objects/companies', {
            properties
        });

        return response.data;
    } catch (error) {
        console.error('HubSpot createCompany error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Update a company in HubSpot
 * @param {string} hubspotId - HubSpot company ID
 * @param {Object} companyData - Updated company data
 * @returns {Object} - Updated HubSpot company
 */
const updateHubSpotCompany = async (hubspotId, companyData) => {
    try {
        const properties = {};

        if (companyData.name) properties.name = companyData.name;
        if (companyData.domain !== undefined) properties.domain = companyData.domain;
        if (companyData.industry !== undefined) properties.industry = companyData.industry;

        const response = await hubspotApi.patch(`/crm/v3/objects/companies/${hubspotId}`, {
            properties
        });

        return response.data;
    } catch (error) {
        console.error('HubSpot updateCompany error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get recently modified companies from HubSpot
 * @param {Date} since - Get companies modified after this date
 * @returns {Array} - Array of HubSpot companies
 */
const getRecentlyModifiedCompanies = async (since = null) => {
    try {
        const filters = [];

        if (since) {
            filters.push({
                propertyName: 'hs_lastmodifieddate',
                operator: 'GTE',
                value: since.getTime()
            });
        }

        const response = await hubspotApi.post('/crm/v3/objects/companies/search', {
            filterGroups: filters.length > 0 ? [{ filters }] : [],
            properties: ['name', 'domain', 'industry', 'hs_lastmodifieddate'],
            limit: 100
        });

        return response.data.results || [];
    } catch (error) {
        console.error('HubSpot getRecentCompanies error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Check if HubSpot is properly configured
 * @returns {boolean}
 */
const isConfigured = () => {
    const token = process.env.HUBSPOT_ACCESS_TOKEN;
    return token && token !== 'your_hubspot_access_token_here';
};

module.exports = {
    createHubSpotContact,
    updateHubSpotContact,
    getRecentlyModifiedContacts,
    createHubSpotCompany,
    updateHubSpotCompany,
    getRecentlyModifiedCompanies,
    isConfigured
};
