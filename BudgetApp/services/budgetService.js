const Income = require('../models/income');
const Expense = require('../models/expense');

async function calculateTotals(userId) {
    try {
        const incomes = await Income.find({ user: userId });
        const totalIncome = incomes.reduce((total, income) => total + income.amount, 0);

        const expenses = await Expense.find({ user: userId });
        const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);

        const total = totalIncome - totalExpense;


        return { totalIncome, totalExpense, total};
    } catch (err) {
        throw err;
    }
}


module.exports = { calculateTotals };