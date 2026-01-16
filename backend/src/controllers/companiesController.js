/**
 * Companies Controller
 * Handles CRUD operations for companies
 */
const Company = require('../models/Company');

/**
 * Create a new company
 * POST /api/companies
 */
const createCompany = async (req, res) => {
    try {
        const { name, domain, industry } = req.body;

        // Manual validation
        if (!name || !name.trim()) {
            console.log('Company creation failed: Name required');
            return res.status(400).json({ error: 'Company name is required' });
        }

        // Check for duplicate domain if provided
        if (domain && domain.trim()) {
            const existingCompany = await Company.findOne({ domain: domain.toLowerCase() });
            if (existingCompany) {
                console.log(`Company creation failed: Domain ${domain} already exists`);
                return res.status(400).json({ error: `Company with domain "${domain}" already exists` });
            }
        }

        const company = new Company({
            name: name.trim(),
            domain: domain ? domain.trim().toLowerCase() : '',
            industry: industry ? industry.trim() : '',
            syncStatus: 'pending'
        });

        await company.save();

        res.status(201).json({
            message: 'Company created successfully',
            company
        });
    } catch (error) {
        console.error('Error creating company:', error.message);
        res.status(500).json({ error: 'Failed to create company' });
    }
};

/**
 * Get all companies
 * GET /api/companies
 */
const getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find().sort({ createdAt: -1 });
        res.json({ companies });
    } catch (error) {
        console.error('Error fetching companies:', error.message);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
};

/**
 * Get a single company by ID
 * GET /api/companies/:id
 */
const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.json({ company });
    } catch (error) {
        console.error('Error fetching company:', error.message);
        res.status(500).json({ error: 'Failed to fetch company' });
    }
};

/**
 * Update a company
 * PUT /api/companies/:id
 */
const updateCompany = async (req, res) => {
    try {
        const { name, domain, industry } = req.body;

        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        // Update fields if provided
        if (name) company.name = name.trim();
        if (domain !== undefined) company.domain = domain.trim().toLowerCase();
        if (industry !== undefined) company.industry = industry.trim();

        // Mark as pending sync since data changed
        company.syncStatus = 'pending';

        await company.save();

        res.json({
            message: 'Company updated successfully',
            company
        });
    } catch (error) {
        console.error('Error updating company:', error.message);
        res.status(500).json({ error: 'Failed to update company' });
    }
};

module.exports = {
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompany
};
