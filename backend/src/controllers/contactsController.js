/**
 * Contacts Controller
 * Handles CRUD operations for contacts
 */
const Contact = require('../models/Contact');

/**
 * Create a new contact
 * POST /api/contacts
 */
const createContact = async (req, res) => {
    try {
        const { name, email, phone, company } = req.body;

        // Manual validation
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check for duplicate email
        const existingContact = await Contact.findOne({ email: email.toLowerCase() });
        if (existingContact) {
            return res.status(400).json({ error: 'Contact with this email already exists' });
        }

        const contact = new Contact({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : '',
            company: company ? company.trim() : '',
            syncStatus: 'pending'
        });

        await contact.save();

        res.status(201).json({
            message: 'Contact created successfully',
            contact
        });
    } catch (error) {
        console.error('Error creating contact:', error.message);
        res.status(500).json({ error: 'Failed to create contact' });
    }
};

/**
 * Get all contacts
 * GET /api/contacts
 */
const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({ contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error.message);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
};

/**
 * Get a single contact by ID
 * GET /api/contacts/:id
 */
const getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json({ contact });
    } catch (error) {
        console.error('Error fetching contact:', error.message);
        res.status(500).json({ error: 'Failed to fetch contact' });
    }
};

/**
 * Update a contact
 * PUT /api/contacts/:id
 */
const updateContact = async (req, res) => {
    try {
        const { name, email, phone, company } = req.body;

        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        // Update fields if provided
        if (name) contact.name = name.trim();
        if (email) contact.email = email.trim().toLowerCase();
        if (phone !== undefined) contact.phone = phone.trim();
        if (company !== undefined) contact.company = company.trim();

        // Mark as pending sync since data changed
        contact.syncStatus = 'pending';

        await contact.save();

        res.json({
            message: 'Contact updated successfully',
            contact
        });
    } catch (error) {
        console.error('Error updating contact:', error.message);
        res.status(500).json({ error: 'Failed to update contact' });
    }
};

/**
 * Delete a contact
 * DELETE /api/contacts/:id
 */
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error.message);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
};

module.exports = {
    createContact,
    getAllContacts,
    getContactById,
    updateContact,
    deleteContact
};
