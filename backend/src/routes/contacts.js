/**
 * Contacts Routes
 * CRUD endpoints for contacts
 */
const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');

// POST /api/contacts - Create a new contact
router.post('/', contactsController.createContact);

// GET /api/contacts - Get all contacts
router.get('/', contactsController.getAllContacts);

// GET /api/contacts/:id - Get a single contact
router.get('/:id', contactsController.getContactById);

// PUT /api/contacts/:id - Update a contact
router.put('/:id', contactsController.updateContact);

// DELETE /api/contacts/:id - Delete a contact
router.delete('/:id', contactsController.deleteContact);

module.exports = router;
