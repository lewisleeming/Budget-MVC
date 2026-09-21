'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authRateLimiter } = require('../middleware/rateLimiter');

router.get('/signup', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('signup');
});

router.post('/signup', authRateLimiter, authController.signup);

router.get('/login', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login');
});

router.post('/login', authRateLimiter, authController.login);

router.get('/logout', authController.logout);
router.post('/logout', authController.logout);

module.exports = router;
