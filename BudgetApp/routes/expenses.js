'use strict';

const express = require('express');
const router = express.Router();
const expensesController = require('../controllers/expensesController');
const checkAuth = require('../middleware/check-auth');
const { validateTransaction } = require('../middleware/validation');

router.get('/add', checkAuth, expensesController.getAddExpense);
router.post('/add', checkAuth, validateTransaction, expensesController.addExpense);

router.get('/:expenseId/edit', checkAuth, expensesController.getEditExpense);
router.post('/:expenseId/edit', checkAuth, validateTransaction, expensesController.updateExpense);

router.delete('/:expenseId', checkAuth, expensesController.deleteExpense);
router.post('/:expenseId/delete', checkAuth, expensesController.deleteExpense);

module.exports = router;
