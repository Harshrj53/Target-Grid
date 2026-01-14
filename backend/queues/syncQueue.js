const Queue = require('bull');

// Create the sync queue
// Ensure Redis is running locally on default port 6379
const syncQueue = new Queue('sync-queue', {
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

module.exports = syncQueue;
