'use strict';

const Income = require('../models/income');
const transactionService = require('../services/transactionService');
const { INCOME_CATEGORIES } = require('../constants/categories');
const { formatDateForInput } = require('../utils/formatters');

exports.getAddIncome = (req, res) => {
    res.render('add-income', {
        categories: INCOME_CATEGORIES,
        today: formatDateForInput(new Date())
    });
};

exports.addIncome = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        await transactionService.addIncome(userId, {
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
        req.flash('success', 'Income recorded successfully.');
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

exports.getEditIncome = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        const income = await Income.findOne({ _id: req.params.incomeId, user: userId });
        if (!income) {
            return res.status(404).render('error', {
                statusCode: 404,
                title: 'Not Found',
                message: 'Income not found or access denied.'
            });
        }

        res.render('edit-income', {
            income,
            categories: INCOME_CATEGORIES,
            formattedDate: formatDateForInput(income.date)
        });
    } catch (err) {
        next(err);
    }
};

exports.updateIncome = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        const updated = await transactionService.updateIncome(userId, req.params.incomeId, {
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
                return res.status(404).json({ error: 'Income not found or access denied.' });
            }
            return res.status(404).render('error', {
                statusCode: 404,
                title: 'Not Found',
                message: 'Income not found or access denied.'
            });
        }

        req.flash('success', 'Income updated successfully.');
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};

exports.deleteIncome = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        const deleted = await transactionService.deleteIncome(userId, req.params.incomeId);

        if (!deleted) {
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(404).json({ error: 'Income not found or access denied.' });
            }
            return res.status(404).render('error', {
                statusCode: 404,
                title: 'Not Found',
                message: 'Income not found or access denied.'
            });
        }

        if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
            return res.status(200).json({ success: true, message: 'Income deleted successfully.' });
        }

        req.flash('success', 'Income deleted successfully.');
        res.redirect('/dashboard');
    } catch (err) {
        next(err);
    }
};
