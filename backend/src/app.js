/**
 * Express Application Setup
 * Main app configuration with middleware and routes
 */
const express = require('express');
const cors = require('cors');

// Import routes
const contactsRoutes = require('./routes/contacts');
const companiesRoutes = require('./routes/companies');
const syncRoutes = require('./routes/sync');
const conflictsRoutes = require('./routes/conflicts');

// Create Express app
const app = express();

/* ========================================
   MIDDLEWARE
   ======================================== */

// Enable CORS for all origins (for development)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Simple request logging (no external library)
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

/* ========================================
   ROUTES
   ======================================== */

// API Routes
app.use('/api/contacts', contactsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/conflicts', conflictsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'HubSpot Bidirectional Sync API',
        version: '1.0.0',
        endpoints: {
            contacts: '/api/contacts',
            companies: '/api/companies',
            sync: '/api/sync',
            conflicts: '/api/conflicts'
        }
    });
});

/* ========================================
   ERROR HANDLING
   ======================================== */

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
