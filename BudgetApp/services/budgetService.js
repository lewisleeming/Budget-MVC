'use strict';

const Income = require('../models/income');
const Expense = require('../models/expense');
const Budget = require('../models/budget');
const User = require('../models/user');
const { EXPENSE_CATEGORIES } = require('../constants/categories');
const {
    getMonthDateRange,
    getCurrentMonthString,
    getRemainingDaysInMonth
} = require('../utils/formatters');

/**
 * Pure calculation helper: daily safe-to-spend
 */
function calculateSafeToSpend(remainingBudget, daysRemaining) {
    if (remainingBudget <= 0 || daysRemaining <= 0) {
        return 0;
    }
    return Number((remainingBudget / daysRemaining).toFixed(2));
}

/**
 * Pure calculation helper: percentage used
 */
function calculatePercentageUsed(spent, budget) {
    if (!budget || budget <= 0) {
        return spent > 0 ? 100 : 0;
    }
    return Number(((spent / budget) * 100).toFixed(1));
}

/**
 * Calculate basic all-time totals (backward compatible)
 */
async function calculateTotals(userId) {
    const incomes = await Income.find({ user: userId });
    const totalIncome = incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const expenses = await Expense.find({ user: userId });
    const totalExpense = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const total = totalIncome - totalExpense;

    return {
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpense: Number(totalExpense.toFixed(2)),
        total: Number(total.toFixed(2))
    };
}

/**
 * Get full monthly financial breakdown for dashboard & analytics
 */
async function getMonthlySummary(userId, monthStr) {
    const activeMonth = monthStr || getCurrentMonthString();
    const { startDate, endDate } = getMonthDateRange(activeMonth);

    // Fetch month-specific items
    const [monthIncomes, monthExpenses, allIncomes, allExpenses, budgetDoc, userDoc] =
        await Promise.all([
            Income.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
            Expense.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
            Income.find({ user: userId }),
            Expense.find({ user: userId }),
            Budget.findOne({ user: userId, month: activeMonth }),
            User.findById(userId)
        ]);

    const monthlyIncome = monthIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const monthlyExpense = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const monthlyBalance = monthlyIncome - monthlyExpense;

    const allTimeIncome = allIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const allTimeExpense = allExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalBalance = allTimeIncome - allTimeExpense;

    // Monthly budget: look up month budget, fallback to user's totalBudget if defined
    let totalBudget = 0;
    let categoryBudgetsMap = {};

    if (budgetDoc) {
        totalBudget = Number(budgetDoc.totalBudget) || 0;
        if (Array.isArray(budgetDoc.categoryBudgets)) {
            budgetDoc.categoryBudgets.forEach((cb) => {
                categoryBudgetsMap[cb.category] = Number(cb.limit) || 0;
            });
        }
    } else if (userDoc && userDoc.totalBudget > 0) {
        totalBudget = Number(userDoc.totalBudget) || 0;
    }

    const remainingBudget = totalBudget - monthlyExpense;
    const percentageUsed = calculatePercentageUsed(monthlyExpense, totalBudget);
    const daysRemaining = getRemainingDaysInMonth(activeMonth);
    const dailySafeToSpend = calculateSafeToSpend(remainingBudget, daysRemaining);

    // Category breakdown
    const categorySpentMap = {};
    monthExpenses.forEach((exp) => {
        const cat = exp.category || 'Other';
        categorySpentMap[cat] = (categorySpentMap[cat] || 0) + Number(exp.amount);
    });

    // Build unified category breakdown list including active categories
    const allRelevantCategories = Array.from(
        new Set([
            ...EXPENSE_CATEGORIES,
            ...Object.keys(categoryBudgetsMap),
            ...Object.keys(categorySpentMap)
        ])
    );

    const categoryBreakdown = allRelevantCategories
        .map((category) => {
            const spent = Number((categorySpentMap[category] || 0).toFixed(2));
            const limit = Number((categoryBudgetsMap[category] || 0).toFixed(2));
            const remaining = Number((limit - spent).toFixed(2));
            const percentage = calculatePercentageUsed(spent, limit);
            return {
                category,
                limit,
                spent,
                remaining,
                percentage,
                isOverBudget: limit > 0 && spent > limit
            };
        })
        .filter((c) => c.spent > 0 || c.limit > 0);

    // Daily spending trends within the month
    const dailySpending = {};
    monthExpenses.forEach((exp) => {
        const dayStr = new Date(exp.date).toISOString().split('T')[0];
        dailySpending[dayStr] = (dailySpending[dayStr] || 0) + Number(exp.amount);
    });

    const spendingTrends = Object.entries(dailySpending)
        .map(([date, amount]) => ({ date, amount: Number(amount.toFixed(2)) }))
        .sort((a, b) => a.date.localeCompare(b.date));

    // 6-Month Income vs Expense history
    const sixMonthHistory = await getMultiMonthComparison(userId, activeMonth, 6);

    return {
        month: activeMonth,
        totalBudget: Number(totalBudget.toFixed(2)),
        monthlyIncome: Number(monthlyIncome.toFixed(2)),
        monthlyExpense: Number(monthlyExpense.toFixed(2)),
        monthlyBalance: Number(monthlyBalance.toFixed(2)),
        totalBalance: Number(totalBalance.toFixed(2)),
        remainingBudget: Number(remainingBudget.toFixed(2)),
        percentageUsed,
        daysRemaining,
        dailySafeToSpend,
        categoryBreakdown,
        categoryBudgetsMap,
        spendingTrends,
        sixMonthHistory,
        incomesCount: monthIncomes.length,
        expensesCount: monthExpenses.length
    };
}

/**
 * Helper to get 6-month historical totals for comparative charts
 */
async function getMultiMonthComparison(userId, currentMonthStr, count = 6) {
    const history = [];
    const [currYear, currMonth] = currentMonthStr.split('-').map(Number);

    for (let i = count - 1; i >= 0; i--) {
        const targetDate = new Date(Date.UTC(currYear, currMonth - 1 - i, 1));
        const monthStr = `${targetDate.getUTCFullYear()}-${String(targetDate.getUTCMonth() + 1).padStart(2, '0')}`;
        const { startDate, endDate } = getMonthDateRange(monthStr);

        const [incomes, expenses] = await Promise.all([
            Income.find({ user: userId, date: { $gte: startDate, $lte: endDate } }),
            Expense.find({ user: userId, date: { $gte: startDate, $lte: endDate } })
        ]);

        const incomeTotal = incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        const expenseTotal = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

        history.push({
            month: monthStr,
            income: Number(incomeTotal.toFixed(2)),
            expense: Number(expenseTotal.toFixed(2))
        });
    }

    return history;
}

/**
 * Set or update monthly budget and category limits
 */
async function setMonthlyBudget(userId, monthStr, totalBudget, categoryBudgets = []) {
    const cleanMonth = monthStr || getCurrentMonthString();
    const cleanTotal = Math.max(0, Number(totalBudget) || 0);

    const formattedCategoryBudgets = (categoryBudgets || [])
        .filter((cb) => cb.category && Number(cb.limit) >= 0)
        .map((cb) => ({
            category: cb.category.trim(),
            limit: Number(cb.limit)
        }));

    const budget = await Budget.findOneAndUpdate(
        { user: userId, month: cleanMonth },
        {
            user: userId,
            month: cleanMonth,
            totalBudget: cleanTotal,
            categoryBudgets: formattedCategoryBudgets
        },
        { upsert: true, new: true, runValidators: true }
    );

    // Also update User default totalBudget for consistency
    await User.findByIdAndUpdate(userId, { totalBudget: cleanTotal });

    return budget;
}

module.exports = {
    calculateTotals,
    calculateSafeToSpend,
    calculatePercentageUsed,
    getMonthlySummary,
    setMonthlyBudget
};
