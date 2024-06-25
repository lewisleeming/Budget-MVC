const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalBudget: { type: Number, default: 0 },
    budgetDate: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
