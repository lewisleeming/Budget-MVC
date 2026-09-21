const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0.01, 'Amount must be greater than zero']
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [200, 'Description cannot exceed 200 characters']
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            trim: true
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
            index: true
        },
        isRecurring: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: ['none', 'weekly', 'monthly', 'yearly'],
            default: 'none'
        }
    },
    { timestamps: true }
);

expenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
