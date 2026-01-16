/**
 * API Service
 * Handles all API calls to the backend using Axios
 */
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:5005/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

/* ========================================
   CONTACTS API
   ======================================== */

/**
 * Get all contacts
 */
export const getContacts = async () => {
    try {
        const response = await api.get('/contacts');
        return response.data.contacts;
    } catch (error) {
        console.error('Error fetching contacts:', error);
        throw error;
    }
};

/**
 * Create a new contact
 */
export const createContact = async (contactData) => {
    try {
        const response = await api.post('/contacts', contactData);
        return response.data;
    } catch (error) {
        console.error('Error creating contact:', error);
        throw error;
    }
};

/**
 * Update a contact
 */
export const updateContact = async (id, contactData) => {
    try {
        const response = await api.put(`/contacts/${id}`, contactData);
        return response.data;
    } catch (error) {
        console.error('Error updating contact:', error);
        throw error;
    }
};

/**
 * Delete a contact
 */
export const deleteContact = async (id) => {
    try {
        const response = await api.delete(`/contacts/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting contact:', error);
        throw error;
    }
};

/* ========================================
   COMPANIES API
   ======================================== */

/**
 * Get all companies
 */
export const getCompanies = async () => {
    try {
        const response = await api.get('/companies');
        return response.data.companies;
    } catch (error) {
        console.error('Error fetching companies:', error);
        throw error;
    }
};

/**
 * Create a new company
 */
export const createCompany = async (companyData) => {
    try {
        const response = await api.post('/companies', companyData);
        return response.data;
    } catch (error) {
        console.error('Error creating company:', error);
        throw error;
    }
};

/**
 * Update a company
 */
export const updateCompany = async (id, companyData) => {
    try {
        const response = await api.put(`/companies/${id}`, companyData);
        return response.data;
    } catch (error) {
        console.error('Error updating company:', error);
        throw error;
    }
};

/* ========================================
   SYNC API
   ======================================== */

/**
 * Get sync status
 */
export const getSyncStatus = async () => {
    try {
        const response = await api.get('/sync/status');
        return response.data.status;
    } catch (error) {
        console.error('Error fetching sync status:', error);
        throw error;
    }
};

/**
 * Trigger a manual sync
 */
export const runSync = async () => {
    try {
        const response = await api.post('/sync/run');
        return response.data;
    } catch (error) {
        console.error('Error running sync:', error);
        throw error;
    }
};

/* ========================================
   CONFLICTS API
   ======================================== */

/**
 * Get all conflicts
 */
export const getConflicts = async (resolved = false) => {
    try {
        const response = await api.get(`/conflicts?resolved=${resolved}`);
        return response.data.conflicts;
    } catch (error) {
        console.error('Error fetching conflicts:', error);
        throw error;
    }
};

/**
 * Resolve a conflict
 */
export const resolveConflict = async (conflictId, resolution) => {
    try {
        const response = await api.post('/conflicts/resolve', {
            conflictId,
            resolution
        });
        return response.data;
    } catch (error) {
        console.error('Error resolving conflict:', error);
        throw error;
    }
};

export default api;
