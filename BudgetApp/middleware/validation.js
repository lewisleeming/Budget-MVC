'use strict';

/**
 * Validate transaction inputs (amounts, description, category, date)
 */
function validateTransaction(req, res, next) {
    const { amount, description, category, date, frequency } = req.body;
    const errors = [];

    // Amount validation: must be a positive number
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        errors.push('Amount must be a positive number greater than 0');
    } else if (numAmount > 10000000) {
        errors.push('Amount exceeds maximum allowed limit (10,000,000)');
    }

    // Description validation: length 1 - 200 characters
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
        errors.push('Description is required');
    } else if (description.trim().length > 200) {
        errors.push('Description cannot exceed 200 characters');
    }

    // Category validation
    if (category !== undefined && typeof category === 'string' && category.trim().length > 50) {
        errors.push('Category cannot exceed 50 characters');
    }

    // Date validation
    if (date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            errors.push('Date must be a valid date');
        } else {
            const year = parsedDate.getFullYear();
            if (year < 2000 || year > 2100) {
                errors.push('Date year must be between 2000 and 2100');
            }
        }
    }

    // Recurring frequency validation
    if (frequency && !['none', 'weekly', 'monthly', 'yearly'].includes(frequency)) {
        errors.push('Invalid recurring frequency specified');
    }

    if (errors.length > 0) {
        if (req.flash) {
            req.flash('error', errors.join('. '));
        }
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(400).json({ errors });
        }
        return res.status(400).render('error', {
            statusCode: 400,
            title: 'Validation Error',
            message: errors.join('. ')
        });
    }

    next();
}

/**
 * Validate budget configuration input
 */
function validateBudget(req, res, next) {
    const { totalBudget, month } = req.body;
    const errors = [];

    if (totalBudget !== undefined) {
        const num = Number(totalBudget);
        if (isNaN(num) || num < 0) {
            errors.push('Total budget must be a positive number or 0');
        }
    }

    if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        errors.push('Month must be in YYYY-MM format');
    }

    if (errors.length > 0) {
        if (req.flash) {
            req.flash('error', errors.join('. '));
        }
        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(400).json({ errors });
        }
        return res.status(400).render('error', {
            statusCode: 400,
            title: 'Validation Error',
            message: errors.join('. ')
        });
    }

    next();
}

module.exports = {
    validateTransaction,
    validateBudget
};
