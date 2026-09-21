# BudgetApp

BudgetApp is a full-stack personal finance application for turning everyday income and spending into a clearer monthly plan. It combines secure account management, transaction tracking, configurable budgets, and interactive financial summaries in one focused dashboard.

Built as a portfolio project, it demonstrates an MVC-style Node.js application with persistent MongoDB data, server-rendered EJS views, protected user sessions, validation, automated tests, and D3-powered data visualisation.

## Features

- Create an account, sign in, and sign out with bcrypt-hashed passwords.
- Record, edit, and delete income and expense transactions.
- Organise expenses by category and mark transactions as recurring.
- Set monthly total budgets and optional category spending limits.
- Review monthly income, expenses, balance, budget usage, remaining budget, and daily safe-to-spend guidance.
- Filter and search transactions by type, category, description, month, and recurring status.
- Sort transaction results by date, amount, description, or category.
- Explore spending through D3 charts for category breakdowns, six-month income versus expense history, and daily spending trends.
- Export filtered transactions to CSV.
- Use CSRF protection, secure session cookies, request logging, rate limiting, validation, and user-scoped database queries.

## Tech Stack

- **Runtime:** Node.js
- **Server:** Express.js
- **Views:** EJS with server-rendered HTML
- **Database:** MongoDB with Mongoose
- **Sessions:** Express Session with MongoDB-backed storage
- **Visualisation:** D3.js
- **Testing:** Jest, Supertest, and MongoDB Memory Server
- **Code quality:** ESLint and Prettier

## Prerequisites

- Node.js and npm
- MongoDB running locally, or a MongoDB Atlas connection string

## Getting Started

1. Clone the repository and open the project directory:

    ```bash
    git clone <repository-url>
    cd BudgetApp
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a local environment file from the example:

    ```bash
    cp .env.example .env
    ```

4. Update `.env` with a MongoDB connection and a strong session secret. The default local database is:

    ```env
    MONGODB_URI=mongodb://127.0.0.1:27017/budgetapp
    ```

5. Start the development server:

    ```bash
    npm run dev
    ```

6. Visit [http://localhost:3000](http://localhost:3000) in a browser and create an account.

## Environment Variables

| Variable          | Purpose                             | Example                               |
| ----------------- | ----------------------------------- | ------------------------------------- |
| `PORT`            | HTTP server port                    | `3000`                                |
| `NODE_ENV`        | Runtime mode                        | `development`                         |
| `MONGODB_URI`     | MongoDB connection string           | `mongodb://127.0.0.1:27017/budgetapp` |
| `SESSION_SECRET`  | Secret used to sign session cookies | Use a long, random value              |
| `CURRENCY_SYMBOL` | Display currency symbol             | `£`                                   |
| `CURRENCY_CODE`   | Display currency code               | `GBP`                                 |

Never commit `.env` or production secrets. Replace the example session secret before deploying.

## Available Commands

| Command                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start the app with Nodemon for automatic restarts |
| `npm start`            | Start the application with Node.js                |
| `npm test`             | Run the Jest test suite                           |
| `npm run lint`         | Check JavaScript files with ESLint                |
| `npm run lint:fix`     | Automatically fix supported ESLint issues         |
| `npm run format`       | Format the project with Prettier                  |
| `npm run format:check` | Check formatting without changing files           |

The test suite uses MongoDB Memory Server, so it does not require a running local MongoDB instance when tests are executed.

## Project Structure

```text
.
├── app.js                 # Express application and middleware configuration
├── server.js              # HTTP server startup and graceful shutdown
├── config/                # Database connection setup
├── constants/             # Shared application values such as categories
├── controllers/           # Request handling and response orchestration
├── middleware/            # Authentication, validation, CSRF, logging, and errors
├── models/                # Mongoose schemas for users, budgets, income, and expenses
├── routes/                # HTTP route definitions
├── services/              # Business logic for authentication, budgets, and transactions
├── public/                # CSS, browser JavaScript, and static data
├── views/                 # EJS pages and forms
├── tests/                 # Unit and integration tests
└── utils/                 # Formatting and date helpers
```

## Application Flow

The application follows a conventional MVC structure:

1. Routes receive HTTP requests and apply authentication and validation middleware.
2. Controllers coordinate the request and response lifecycle.
3. Services contain reusable business rules and database operations.
4. Mongoose models persist user, budget, income, and expense data in MongoDB.
5. EJS views render the dashboard and forms, while browser-side D3 code turns dashboard data into charts.

## Production Notes

Set `NODE_ENV=production`, configure a managed MongoDB instance, and provide a strong `SESSION_SECRET`. The application enables proxy trust for deployments behind HTTPS proxies and marks session cookies as secure in production.

## Project Status

This is an actively developing portfolio project. The current foundation covers authentication, financial data management, budgeting, analytics, export, security middleware, and automated testing, with room for future enhancements such as richer account preferences and expanded reporting.
