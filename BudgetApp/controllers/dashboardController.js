'use strict';

const budgetService = require('../services/budgetService');
const transactionService = require('../services/transactionService');
const { EXPENSE_CATEGORIES } = require('../constants/categories');
const {
    formatCurrency,
    formatDate,
    formatDateForInput,
    getCurrentMonthString
} = require('../utils/formatters');

exports.getDashboard = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        const selectedMonth = req.query.month || getCurrentMonthString();

        const filterParams = {
            month: selectedMonth,
            type: req.query.type || 'all',
            category: req.query.category || 'all',
            search: req.query.search || '',
            sortBy: req.query.sortBy || 'date',
            sortOrder: req.query.sortOrder || 'desc',
            recurringOnly: req.query.recurring === 'true'
        };

        const [summary, transactions] = await Promise.all([
            budgetService.getMonthlySummary(userId, selectedMonth),
            transactionService.getTransactions(userId, filterParams)
        ]);

        res.render('dashboard', {
            user: req.session.user,
            summary,
            transactions,
            filterParams,
            expenseCategories: EXPENSE_CATEGORIES,
            formatCurrency,
            formatDate,
            formatDateForInput,
            currentMonth: getCurrentMonthString()
        });
    } catch (err) {
        next(err);
    }
};

exports.setBudget = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        const month = req.body.month || getCurrentMonthString();
        const totalBudget = Number(req.body.totalBudget) || 0;

        // Parse category limits from form body
        // Form sends limit_<categoryName>=<amount>
        const categoryBudgets = [];
        EXPENSE_CATEGORIES.forEach((cat) => {
            const formKey = `limit_${cat.replace(/[^a-zA-Z0-9]/g, '_')}`;
            if (req.body[formKey] !== undefined && req.body[formKey] !== '') {
                const limit = Number(req.body[formKey]);
                if (!isNaN(limit) && limit >= 0) {
                    categoryBudgets.push({ category: cat, limit });
                }
            }
        });

        await budgetService.setMonthlyBudget(userId, month, totalBudget, categoryBudgets);
        req.flash('success', `Budget for ${month} updated successfully.`);
        res.redirect(`/dashboard?month=${encodeURIComponent(month)}`);
    } catch (err) {
        next(err);
    }
};

exports.exportCSV = async (req, res, next) => {
    try {
        const userId = req.session.user._id;
        const month = req.query.month || getCurrentMonthString();

        const csvContent = await transactionService.exportTransactionsToCSV(userId, {
            month,
            type: req.query.type || 'all',
            category: req.query.category || 'all',
            search: req.query.search || '',
            sortBy: req.query.sortBy || 'date',
            sortOrder: req.query.sortOrder || 'desc'
        });

        const filename = `budget-transactions-${month}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(csvContent);
    } catch (err) {
        next(err);
    }
};
