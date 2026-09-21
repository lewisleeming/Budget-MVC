'use strict';

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication endpoints (login & signup)
 * Limits brute force attempts to 10 requests per 15 minutes per IP
 */
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15, // Allow up to 15 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    handler: (req, res, next, options) => {
        if (req.flash) {
            req.flash('error', options.message);
        }
        res.status(429);
        if (req.accepts('html')) {
            return res.redirect(
                req.originalUrl.includes('signup') ? '/auth/signup' : '/auth/login'
            );
        }
        return res.json({ error: options.message });
    },
    skip: () => process.env.NODE_ENV === 'test'
});

module.exports = {
    authRateLimiter
};
