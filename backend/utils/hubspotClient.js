const axios = require('axios');

const HUBSPOT_BASE_URL = 'https://api.hubapi.com/crm/v3/objects/contacts';
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

const client = axios.create({
    baseURL: HUBSPOT_BASE_URL,
    headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

// Simple sleep utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simple Rate Limiter & Retry Wrapper
// HubSpot allows ~100 requests/10s usually. 
// We will add a small delay and retry on 429.
const hubspotRequest = async (method, url, data = {}, retries = 3) => {
    try {
        // Rate limiting: intentional delay to prevent bursting
        await sleep(200);

        const response = await client({ method, url, data });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 429 && retries > 0) {
            console.warn('Rate limited by HubSpot. Retrying...');
            await sleep(2000 * (4 - retries)); // Exponential backoff
            return hubspotRequest(method, url, data, retries - 1);
        }

        // Rethrow other errors
        throw error;
    }
};

module.exports = hubspotRequest;
