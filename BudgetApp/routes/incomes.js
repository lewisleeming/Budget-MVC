const express = require('express');
const router = express.Router();
const incomesController = require('../controllers/incomesController');
const checkAuth = require('../middleware/check-auth');

router.get('/add', checkAuth, (req, res) => res.render('add-income'));
router.post('/add', checkAuth, incomesController.addIncome);
router.delete('/:incomeId', checkAuth, incomesController.deleteIncome);

module.exports = router;
