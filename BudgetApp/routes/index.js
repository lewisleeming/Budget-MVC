'use strict';

const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const dashboardController = require('../controllers/dashboardController');
const { validateBudget } = require('../middleware/validation');

router.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect('/dashboard');
    }
    return res.redirect('/auth/login');
});

router.get('/dashboard', checkAuth, dashboardController.getDashboard);
router.post('/set-budget', checkAuth, validateBudget, dashboardController.setBudget);
router.get('/transactions/export', checkAuth, dashboardController.exportCSV);

module.exports = router;
