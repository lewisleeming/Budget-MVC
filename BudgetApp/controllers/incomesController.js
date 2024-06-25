const Income = require('../models/income');
const mongoose = require("mongoose");

exports.addIncome = (req, res) => {
    const { amount, description } = req.body;
    const newIncome = new Income({
        user: req.session.user._id,
        amount,
        description
    });

    newIncome.save()
        .then(() => res.redirect('/dashboard'))
        .catch(err => res.status(500).json({ error: err }));
};

exports.deleteIncome = (req, res) => {
    const id = req.params.incomeId;
    Income.deleteOne({ _id: id })
      .exec()
      .then(result => {
        res.status(204).json({
          message: "Income deleted",
          request: {
            type: "DELETE",
            url: "http://localhost:3000/incomes"
          }
        });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
};
