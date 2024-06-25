const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const dashboardController = require('../controllers/dashboardController');

router.get('/', (req, res) => res.redirect('/auth/login'));

router.get('/dashboard', checkAuth, dashboardController.getDashboard);
router.post('/set-budget', checkAuth, dashboardController.setBudget);

module.exports = router;
