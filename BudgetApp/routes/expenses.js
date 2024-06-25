const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesController');
const checkAuth = require('../middleware/check-auth');

router.get('/add', checkAuth, (req, res) => res.render('add-expense'));
router.post('/add', checkAuth, expensesController.addExpense);
router.delete('/:expenseId', checkAuth, expensesController.deleteExpense);

module.exports = router;
