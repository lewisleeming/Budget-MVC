'use strict';

const Expense = require('../models/expense');
const transactionService = require('../services/transactionService');
const { EXPENSE_CATEGORIES } = require('../constants/categories');
const { formatDateForInput } = require('../utils/formatters');

exports.getAddExpense = (req, res) => {
    res.render('add-expense', {
        categories: EXPENSE_CATEGORIES,
        today: formatDateForInput(new Date())
    });
};

exports.addExpense = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        await transactionService.addExpense(userId, {
            amount: req.body.amount,
            description: req.body.description,
            category: req.body.category,
            date: req.body.date,
            isRecurring:
                req.body.isRecurring === 'true' ||
                req.body.isRecurring === true ||
                req.body.isRecurring === 'on',
            frequency: req.body.frequency
        });
        req.flash('success', 'Expense recorded successfully.');
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

exports.getEditExpense = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        const expense = await Expense.findOne({ _id: req.params.expenseId, user: userId });
        if (!expense) {
            return res.status(404).render('error', {
                statusCode: 404,
                title: 'Not Found',
                message: 'Expense not found or access denied.'
            });
        }

        res.render('edit-expense', {
            expense,
            categories: EXPENSE_CATEGORIES,
            formattedDate: formatDateForInput(expense.date)
        });
    } catch (err) {
        next(err);
    }
};

exports.updateExpense = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        const updated = await transactionService.updateExpense(userId, req.params.expenseId, {
            amount: req.body.amount,
            description: req.body.description,
            category: req.body.category,
            date: req.body.date,
            isRecurring:
                req.body.isRecurring === 'true' ||
                req.body.isRecurring === true ||
                req.body.isRecurring === 'on',
            frequency: req.body.frequency
        });

        if (!updated) {
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(404).json({ error: 'Expense not found or access denied.' });
            }
            return res.status(404).render('error', {
                statusCode: 404,
                title: 'Not Found',
                message: 'Expense not found or access denied.'
            });
        }

        req.flash('success', 'Expense updated successfully.');
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

exports.deleteExpense = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        const deleted = await transactionService.deleteExpense(userId, req.params.expenseId);

        if (!deleted) {
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(404).json({ error: 'Expense not found or access denied.' });
            }
            return res.status(404).render('error', {
                statusCode: 404,
                title: 'Not Found',
                message: 'Expense not found or access denied.'
            });
        }

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res
                .status(200)
                .json({ success: true, message: 'Expense deleted successfully.' });
        }

        req.flash('success', 'Expense deleted successfully.');
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};
