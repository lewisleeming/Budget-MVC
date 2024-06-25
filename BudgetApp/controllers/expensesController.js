const Expense = require('../models/expense');

exports.addExpense = (req, res) => {
    const { amount, description, category } = req.body;
    const newExpense = new Expense({
        user: req.session.user._id,
        amount,
        description,
        category
    });

    newExpense.save()
        .then(() => res.redirect('/dashboard'))
        .catch(err => res.status(500).json({ error: err }));
};

exports.deleteExpense = (req, res) => {
    const id = req.params.expenseId;
    Expense.deleteOne({ _id: id })
      .exec()
      .then(result => {
        res.status(204).json({
          message: "Expense deleted",
          request: {
            type: "DELETE",
            url: "http://localhost:3000/expenses"
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          message: "failed"
        });
      });
};
