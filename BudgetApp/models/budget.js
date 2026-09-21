const mongoose = require('mongoose');

const categoryBudgetSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            trim: true
        },
        limit: {
            type: Number,
            required: true,
            min: [0, 'Category limit cannot be negative']
        }
    },
    { _id: false }
);

const budgetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        month: {
            type: String,
            required: true,
            match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format']
        },
        totalBudget: {
            type: Number,
            default: 0,
            min: [0, 'Total budget cannot be negative']
        },
        categoryBudgets: [categoryBudgetSchema]
    },
    { timestamps: true }
);

budgetSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
