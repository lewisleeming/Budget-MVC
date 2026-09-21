'use strict';

const express = require('express');
const router = express.Router();
const incomesController = require('../controllers/incomesController');
const checkAuth = require('../middleware/check-auth');
const { validateTransaction } = require('../middleware/validation');

router.get('/add', checkAuth, incomesController.getAddIncome);
router.post('/add', checkAuth, validateTransaction, incomesController.addIncome);

router.get('/:incomeId/edit', checkAuth, incomesController.getEditIncome);
router.post('/:incomeId/edit', checkAuth, validateTransaction, incomesController.updateIncome);

router.delete('/:incomeId', checkAuth, incomesController.deleteIncome);
router.post('/:incomeId/delete', checkAuth, incomesController.deleteIncome);

module.exports = router;
