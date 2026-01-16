/**
 * Companies Routes
 * CRUD endpoints for companies
 */
const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companiesController');

// POST /api/companies - Create a new company
router.post('/', companiesController.createCompany);

// GET /api/companies - Get all companies
router.get('/', companiesController.getAllCompanies);

// GET /api/companies/:id - Get a single company
router.get('/:id', companiesController.getCompanyById);

// PUT /api/companies/:id - Update a company
router.put('/:id', companiesController.updateCompany);

module.exports = router;
