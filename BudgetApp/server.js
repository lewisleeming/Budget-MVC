'use strict';

require('dotenv').config();
const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(port, () => {
    console.log(
        `Budget App running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`
    );
});

// Graceful shutdown
const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection
            .close(false)
            .then(() => {
                console.log('MongoDB connection closed.');
                process.exit(0);
            })
            .catch(() => process.exit(1));
    });

    // Force exit after 10 seconds if still hanging
    setTimeout(() => {
        console.error('Forcing shutdown after timeout.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
