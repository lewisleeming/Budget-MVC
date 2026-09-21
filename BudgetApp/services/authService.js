'use strict';

const bcrypt = require('bcrypt');
const User = require('../models/user');

const SALT_ROUNDS = 10;

/**
 * Validate password requirements
 * Minimum 8 characters, at least one letter and at least one number
 */
function validatePassword(password) {
    if (!password || typeof password !== 'string') {
        return { isValid: false, message: 'Password is required' };
    }
    if (password.length < 8) {
        return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/[A-Za-z]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
}

/**
 * Validate email format
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { isValid: false, message: 'Email is required' };
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email.trim())) {
        return { isValid: false, message: 'Please provide a valid email address' };
    }
    return { isValid: true };
}

/**
 * Register a new user with friendly duplicate check
 */
async function registerUser(email, password) {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        const error = new Error(emailValidation.message);
        error.statusCode = 400;
        throw error;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        const error = new Error(passwordValidation.message);
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check for existing user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
        const error = new Error(
            'An account with this email address already exists. Please log in.'
        );
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
        email: normalizedEmail,
        password: hashedPassword
    });

    try {
        return await user.save();
    } catch (err) {
        if (err.code === 11000) {
            const error = new Error(
                'An account with this email address already exists. Please log in.'
            );
            error.statusCode = 409;
            throw error;
        }
        throw err;
    }
}

/**
 * Authenticate user credentials
 */
async function authenticateUser(email, password) {
    if (!email || !password) {
        const error = new Error('Email and password are required');
        error.statusCode = 400;
        throw error;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    return user;
}

module.exports = {
    validatePassword,
    validateEmail,
    registerUser,
    authenticateUser
};
