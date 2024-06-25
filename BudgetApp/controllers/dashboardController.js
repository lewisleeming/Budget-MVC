const Income = require('../models/income');
const Expense = require('../models/expense');
const User = require('../models/user');
const budgetService = require('../services/budgetService');

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const incomes = await Income.find({ user: userId });
        const expenses = await Expense.find({ user: userId });
        const { totalIncome, totalExpense, total } = await budgetService.calculateTotals(userId);
        const user = await User.findById(req.session.user._id);

        res.render('dashboard', {
            user: req.session.user,
            incomes,
            expenses,
            totalIncome,
            totalExpense,
            total,
            totalBudget: user.totalBudget || 0
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching dashboard data" });
    }
};

exports.setBudget = async (req, res) => {
    const { totalBudget, budgetDate } = req.body;

    try {
        const user = await User.findById(req.session.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.totalBudget = totalBudget;
        user.budgetDate = budgetDate;
        const updatedUser = await user.save();

        req.session.user = updatedUser; // Update session user with the latest data
        res.redirect('/dashboard');
    } catch (err) {
        res.status(500).json({ message: "Error setting budget" });
    }
};
