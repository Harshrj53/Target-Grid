const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.get('/contacts', contactController.getContacts);
router.post('/contacts', contactController.createContact);
router.put('/contacts/:id', contactController.updateContact);

router.get('/stats', contactController.getStats);
router.get('/conflicts', contactController.getConflicts);
router.post('/conflicts/resolve', contactController.resolveConflict);

module.exports = router;
