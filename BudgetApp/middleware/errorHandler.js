'use strict';

/**
 * 404 Not Found Handler
 */
function notFoundHandler(req, res, next) {
    const error = new Error(`Page Not Found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
}

/**
 * Central Error Handler
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || 'An unexpected error occurred. Please try again later.';

    if (statusCode >= 500) {
        console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
    }

    // JSON response for API or AJAX calls
    if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
        return res.status(statusCode).json({
            error: message,
            statusCode,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        });
    }

    // Render friendly HTML error page
    res.status(statusCode).render('error', {
        statusCode,
        title:
            statusCode === 404
                ? 'Page Not Found'
                : statusCode === 403
                  ? 'Access Forbidden'
                  : 'Application Error',
        message,
        stack: process.env.NODE_ENV !== 'production' ? err.stack : null
    });
}

module.exports = {
    notFoundHandler,
    errorHandler
};
