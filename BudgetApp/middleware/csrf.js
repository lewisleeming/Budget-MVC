'use strict';

const crypto = require('crypto');

/**
 * Middleware to generate and enforce CSRF tokens across sessions
 */
function csrfMiddleware(req, res, next) {
    if (!req.session) {
        return next();
    }

    // Initialize CSRF token in session if not present
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }

    // Expose CSRF token to EJS templates and responses
    res.locals.csrfToken = req.session.csrfToken;

    // Safe read-only HTTP methods
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
        return next();
    }

    // In test environment, bypass unless explicitly enforcing to test CSRF defense
    if (process.env.NODE_ENV === 'test' && req.headers['x-enforce-csrf'] !== 'true') {
        return next();
    }

    // Extract submitted token
    const clientToken =
        (req.body && req.body._csrf) ||
        req.headers['x-csrf-token'] ||
        req.headers['csrf-token'] ||
        req.query._csrf;

    if (!clientToken || clientToken !== req.session.csrfToken) {
        const error = new Error(
            'Invalid or missing CSRF token. Please refresh the page and try again.'
        );
        error.statusCode = 403;
        return next(error);
    }

    next();
}

module.exports = csrfMiddleware;
