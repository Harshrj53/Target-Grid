/**
 * Server Entry Point
 * Starts the Express server, connects to MongoDB, and begins sync polling
 */
require('dotenv').config();

const app = require('./app');
const connectDB = require('./utils/db');
const syncService = require('./services/syncService');

// Get port from environment or use default
const PORT = process.env.PORT || 5005;

/**
 * Start the server
 */
const startServer = async () => {
    try {
        // Step 1: Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await connectDB();

        // Step 2: Start the Express server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log('');
            console.log('Available endpoints:');
            console.log(`  GET  /                    - API info`);
            console.log(`  GET  /health              - Health check`);
            console.log(`  CRUD /api/contacts        - Contacts management`);
            console.log(`  CRUD /api/companies       - Companies management`);
            console.log(`  POST /api/sync/run        - Trigger sync`);
            console.log(`  GET  /api/sync/status     - Sync status`);
            console.log(`  GET  /api/conflicts       - View conflicts`);
            console.log(`  POST /api/conflicts/resolve - Resolve conflict`);
            console.log('');
        });

        // Step 3: Start polling-based sync (setInterval)
        // This runs in the background and syncs with HubSpot periodically
        syncService.startPolling();

    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    syncService.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down gracefully...');
    syncService.stopPolling();
    process.exit(0);
});

// Start the server
startServer();
