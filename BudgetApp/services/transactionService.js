'use strict';

const Expense = require('../models/expense');
const Income = require('../models/income');
const { getMonthDateRange, formatDate } = require('../utils/formatters');

/**
 * Fetch and merge transactions (expenses + incomes) with search, filter, and sorting
 */
async function getTransactions(userId, options = {}) {
    const {
        month,
        startDate,
        endDate,
        type = 'all', // 'all' | 'expense' | 'income'
        category,
        search,
        sortBy = 'date', // 'date' | 'amount' | 'description' | 'category'
        sortOrder = 'desc', // 'asc' | 'desc'
        recurringOnly = false
    } = options;

    // Date filtering query
    const dateQuery = {};
    if (startDate || endDate) {
        if (startDate) dateQuery.$gte = new Date(startDate);
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateQuery.$lte = end;
        }
    } else if (month) {
        const range = getMonthDateRange(month);
        dateQuery.$gte = range.startDate;
        dateQuery.$lte = range.endDate;
    }

    const baseQuery = { user: userId };
    if (Object.keys(dateQuery).length > 0) {
        baseQuery.date = dateQuery;
    }
    if (recurringOnly) {
        baseQuery.isRecurring = true;
    }

    let expenses = [];
    let incomes = [];

    // Fetch expenses if requested
    if (type === 'all' || type === 'expense') {
        const expQuery = { ...baseQuery };
        if (category && category !== 'all') {
            expQuery.category = category;
        }
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            expQuery.$or = [{ description: regex }, { category: regex }];
        }
        expenses = await Expense.find(expQuery).lean();
    }

    // Fetch incomes if requested
    if (type === 'all' || type === 'income') {
        const incQuery = { ...baseQuery };
        if (category && category !== 'all') {
            incQuery.category = category;
        }
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            incQuery.$or = [{ description: regex }, { category: regex }];
        }
        incomes = await Income.find(incQuery).lean();
    }

    // Tag and combine
    const unified = [
        ...expenses.map((e) => ({ ...e, type: 'expense' })),
        ...incomes.map((i) => ({ ...i, type: 'income', category: i.category || 'Income' }))
    ];

    // Sorting
    unified.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === 'date') {
            valA = new Date(valA).getTime();
            valB = new Date(valB).getTime();
        } else if (sortBy === 'amount') {
            valA = Number(valA);
            valB = Number(valB);
        } else {
            valA = String(valA || '').toLowerCase();
            valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return unified;
}

/**
 * Add an expense for a user
 */
async function addExpense(userId, data) {
    const expense = new Expense({
        user: userId,
        amount: Number(data.amount),
        description: data.description.trim(),
        category: data.category.trim(),
        date: data.date ? new Date(data.date) : new Date(),
        isRecurring: Boolean(data.isRecurring),
        frequency: data.frequency || 'none'
    });
    return await expense.save();
}

/**
 * Update an expense ensuring IDOR safety
 */
async function updateExpense(userId, expenseId, data) {
    const updatePayload = {
        amount: Number(data.amount),
        description: data.description.trim(),
        category: data.category.trim(),
        date: data.date ? new Date(data.date) : new Date(),
        isRecurring: Boolean(data.isRecurring),
        frequency: data.frequency || 'none'
    };
    return await Expense.findOneAndUpdate({ _id: expenseId, user: userId }, updatePayload, {
        new: true,
        runValidators: true
    });
}

/**
 * Delete an expense ensuring IDOR safety
 */
async function deleteExpense(userId, expenseId) {
    return await Expense.findOneAndDelete({ _id: expenseId, user: userId });
}

/**
 * Add an income for a user
 */
async function addIncome(userId, data) {
    const income = new Income({
        user: userId,
        amount: Number(data.amount),
        description: data.description.trim(),
        category: (data.category && data.category.trim()) || 'Income',
        date: data.date ? new Date(data.date) : new Date(),
        isRecurring: Boolean(data.isRecurring),
        frequency: data.frequency || 'none'
    });
    return await income.save();
}

/**
 * Update an income ensuring IDOR safety
 */
async function updateIncome(userId, incomeId, data) {
    const updatePayload = {
        amount: Number(data.amount),
        description: data.description.trim(),
        category: (data.category && data.category.trim()) || 'Income',
        date: data.date ? new Date(data.date) : new Date(),
        isRecurring: Boolean(data.isRecurring),
        frequency: data.frequency || 'none'
    };
    return await Income.findOneAndUpdate({ _id: incomeId, user: userId }, updatePayload, {
        new: true,
        runValidators: true
    });
}

/**
 * Delete an income ensuring IDOR safety
 */
async function deleteIncome(userId, incomeId) {
    return await Income.findOneAndDelete({ _id: incomeId, user: userId });
}

/**
 * Generate CSV string from transactions
 */
async function exportTransactionsToCSV(userId, options = {}) {
    const transactions = await getTransactions(userId, options);

    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Recurring', 'Frequency'];
    const rows = transactions.map((t) => [
        `"${formatDate(t.date)}"`,
        `"${t.type.toUpperCase()}"`,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.type === 'expense'
            ? `"-${Number(t.amount).toFixed(2)}"`
            : `"+${Number(t.amount).toFixed(2)}"`,
        `"${t.isRecurring ? 'Yes' : 'No'}"`,
        `"${t.frequency || 'none'}"`
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

module.exports = {
    getTransactions,
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    exportTransactionsToCSV
};
