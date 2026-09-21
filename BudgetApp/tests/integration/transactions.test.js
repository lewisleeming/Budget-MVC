'use strict';

require('../setup');
const request = require('supertest');
const app = require('../../app');
const Expense = require('../../models/expense');
const Income = require('../../models/income');

describe('Integration Tests: Transactions, IDOR Prevention & Validation', () => {
    let agentUserA;
    let agentUserB;

    beforeEach(async () => {
        // Setup User A
        agentUserA = request.agent(app);
        await agentUserA
            .post('/auth/signup')
            .send({ email: 'usera@example.com', password: 'Password123' });
        await agentUserA
            .post('/auth/login')
            .send({ email: 'usera@example.com', password: 'Password123' });

        // Setup User B
        agentUserB = request.agent(app);
        await agentUserB
            .post('/auth/signup')
            .send({ email: 'userb@example.com', password: 'Password123' });
        await agentUserB
            .post('/auth/login')
            .send({ email: 'userb@example.com', password: 'Password123' });
    });

    describe('IDOR & Access Control Security', () => {
        test('User B cannot delete User A expense', async () => {
            // User A creates an expense
            await agentUserA.post('/expenses/add').send({
                amount: '45.50',
                description: 'User A groceries',
                category: 'Groceries'
            });

            const userAExpense = await Expense.findOne({ description: 'User A groceries' });
            expect(userAExpense).not.toBeNull();

            // User B attempts to delete User A's expense
            const attackRes = await agentUserB
                .post(`/expenses/${userAExpense._id}/delete`)
                .send({});

            expect(attackRes.status).toBe(404);

            // Verify expense still exists in database!
            const checkExpense = await Expense.findById(userAExpense._id);
            expect(checkExpense).not.toBeNull();
        });

        test('User B cannot edit User A expense', async () => {
            await agentUserA.post('/expenses/add').send({
                amount: '100.00',
                description: 'Private confidential expense',
                category: 'Shopping'
            });

            const expense = await Expense.findOne({ description: 'Private confidential expense' });

            const editRes = await agentUserB.post(`/expenses/${expense._id}/edit`).send({
                amount: '0.01',
                description: 'Hacked description',
                category: 'Shopping'
            });

            expect(editRes.status).toBe(404);

            // Verify data remained unchanged
            const check = await Expense.findById(expense._id);
            expect(check.amount).toBe(100.0);
            expect(check.description).toBe('Private confidential expense');
        });

        test('User B cannot delete User A income', async () => {
            await agentUserA.post('/incomes/add').send({
                amount: '2500.00',
                description: 'User A salary',
                category: 'Salary'
            });

            const income = await Income.findOne({ description: 'User A salary' });
            expect(income).not.toBeNull();

            // User B tries to delete
            const attackRes = await agentUserB.post(`/incomes/${income._id}/delete`).send({});

            expect(attackRes.status).toBe(404);

            const check = await Income.findById(income._id);
            expect(check).not.toBeNull();
        });

        test('User A can successfully delete their own expense', async () => {
            await agentUserA.post('/expenses/add').send({
                amount: '20.00',
                description: 'Coffee',
                category: 'Dining Out'
            });

            const expense = await Expense.findOne({ description: 'Coffee' });

            const deleteRes = await agentUserA.post(`/expenses/${expense._id}/delete`).send({});

            expect(deleteRes.status).toBe(302);
            expect(deleteRes.headers.location).toBe('/dashboard');

            const check = await Expense.findById(expense._id);
            expect(check).toBeNull();
        });
    });

    describe('Input Validation', () => {
        test('Rejects negative amount when adding expense', async () => {
            const res = await agentUserA.post('/expenses/add').send({
                amount: '-50.00',
                description: 'Negative invalid amount',
                category: 'Groceries'
            });

            expect(res.status).toBe(400);
        });

        test('Rejects empty description when adding income', async () => {
            const res = await agentUserA.post('/incomes/add').send({
                amount: '100.00',
                description: '   ',
                category: 'Salary'
            });

            expect(res.status).toBe(400);
        });
    });

    describe('Monthly Budgeting & CSV Export', () => {
        test('POST /set-budget updates total budget and category limits', async () => {
            const res = await agentUserA.post('/set-budget').send({
                month: '2026-09',
                totalBudget: '1500',
                limit_Groceries: '400',
                limit_Dining_Out: '200'
            });

            expect(res.status).toBe(302);
            expect(res.headers.location).toContain('month=2026-09');
        });

        test('GET /transactions/export generates valid CSV file', async () => {
            await agentUserA.post('/expenses/add').send({
                amount: '55.00',
                description: 'Weekly petrol',
                category: 'Petrol & Travel',
                isRecurring: 'true',
                frequency: 'weekly'
            });

            const res = await agentUserA.get('/transactions/export?month=2026-09');

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toContain('text/csv');
            expect(res.headers['content-disposition']).toContain('attachment; filename=');
            expect(res.text).toContain('Date,Type,Category,Description,Amount,Recurring,Frequency');
            expect(res.text).toContain('Weekly petrol');
            expect(res.text).toContain('-55.00');
        });
    });
});
