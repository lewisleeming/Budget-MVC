'use strict';

/**
 * Structured request logging middleware
 */
function requestLogger(req, res, next) {
    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    const start = Date.now();
    const { method, originalUrl, ip } = req;

    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const logEntry = {
            timestamp: new Date().toISOString(),
            method,
            url: originalUrl,
            status: statusCode,
            durationMs: duration,
            ip,
            user: req.session?.user?._id || 'anonymous'
        };

        if (statusCode >= 500) {
            console.error(JSON.stringify(logEntry));
        } else if (statusCode >= 400) {
            console.warn(JSON.stringify(logEntry));
        } else {
            console.log(JSON.stringify(logEntry));
        }
    });

    next();
}

module.exports = requestLogger;
