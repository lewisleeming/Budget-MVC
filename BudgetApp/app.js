const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('./config/database');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();

const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const incomesRoutes = require('./routes/incomes');
const expensesRoutes = require('./routes/expenses');

//cross origin
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session management
app.use(session({
    secret: 'your_secret_key',//remember to replace
    resave: false,
    saveUninitialized: false
}));

// Flash messages
app.use(flash());

// Set view engine to EJS
app.set('view engine', 'ejs');

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/incomes', incomesRoutes);
app.use('/expenses', expensesRoutes);

module.exports = app;