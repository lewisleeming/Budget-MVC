const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        currency: {
            type: String,
            default: 'GBP',
            trim: true
        },
        totalBudget: {
            type: Number,
            default: 0,
            min: 0
        },
        budgetDate: {
            type: Date
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
