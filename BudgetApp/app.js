'use strict';

require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const connectMongoPkg = require('connect-mongo');
const MongoStore = connectMongoPkg.MongoStore || connectMongoPkg.default || connectMongoPkg;
const flash = require('connect-flash');

// Initialize database connection
require('./config/database');

const requestLogger = require('./middleware/logger');
const csrfMiddleware = require('./middleware/csrf');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const incomesRoutes = require('./routes/incomes');
const expensesRoutes = require('./routes/expenses');

const app = express();

// Trust reverse proxy (needed for secure cookies behind HTTPS proxies like Render, Heroku, AWS)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Structured request logger
app.use(requestLogger);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Persistent Session Store configuration
const sessionSecret =
    process.env.SESSION_SECRET || 'budget_mvc_dev_fallback_secret_must_be_changed_in_prod';
const isProduction = process.env.NODE_ENV === 'production';

const sessionStore =
    process.env.NODE_ENV === 'test'
        ? new session.MemoryStore()
        : MongoStore.create({
              mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/budgetapp',
              ttl: 14 * 24 * 60 * 60, // 14 days
              autoRemove: 'native'
          });

app.use(
    session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
        }
    })
);

// Flash messages
app.use(flash());

// CSRF Protection
app.use(csrfMiddleware);

// Global template locals (user, flash messages, CSRF token)
app.use((req, res, next) => {
    res.locals.user = req.session?.user || null;
    res.locals.messages = req.flash();
    res.locals.csrfToken = req.session?.csrfToken || '';
    next();
});

// Route handlers
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/incomes', incomesRoutes);
app.use('/expenses', expensesRoutes);

// Central error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
