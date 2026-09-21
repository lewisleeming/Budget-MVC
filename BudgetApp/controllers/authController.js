'use strict';

const authService = require('../services/authService');

exports.signup = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        await authService.registerUser(email, password);
        req.flash('success', 'Registration successful! You can now log in.');
        res.redirect('/auth/login');
    } catch (err) {
        const statusCode = err.statusCode || 500;
        if (statusCode === 400 || statusCode === 409) {
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(statusCode).json({ error: err.message });
            }
            req.flash('error', err.message);
            return res.status(statusCode).render('signup', {
                messages: { error: [err.message] }
            });
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await authService.authenticateUser(email, password);
        req.session.user = {
            _id: user._id,
            email: user.email,
            currency: user.currency || 'GBP'
        };
        req.flash('success', 'Logged in successfully.');
        res.redirect('/dashboard');
    } catch (err) {
        const statusCode = err.statusCode || 500;
        if (statusCode === 400 || statusCode === 401) {
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(statusCode).json({ error: err.message });
            }
            req.flash('error', err.message);
            return res.status(statusCode).render('login', {
                messages: { error: [err.message] }
            });
        }
        next(err);
    }
};

exports.logout = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/auth/login');
    });
};
