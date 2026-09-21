'use strict';

require('../setup');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user');

describe('Integration Tests: Authentication & User Management', () => {
    test('POST /auth/signup successfully registers a new user with hashed password', async () => {
        const res = await request(app).post('/auth/signup').send({
            email: 'testuser@example.com',
            password: 'Password123'
        });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/auth/login');

        const user = await User.findOne({ email: 'testuser@example.com' });
        expect(user).not.toBeNull();
        expect(user.password).not.toBe('Password123'); // Password must be hashed
        expect(user.password.startsWith('$2')).toBe(true);
    });

    test('POST /auth/signup rejects duplicate email with friendly 409 error', async () => {
        // First registration
        await request(app)
            .post('/auth/signup')
            .send({ email: 'duplicate@example.com', password: 'Password123' });

        // Duplicate registration
        const res = await request(app)
            .post('/auth/signup')
            .send({ email: 'DUPLICATE@example.com', password: 'Password456' });

        expect(res.status).toBe(409);
        expect(res.text).toContain('An account with this email address already exists');
    });

    test('POST /auth/signup rejects weak password (< 8 chars or no numbers)', async () => {
        const res = await request(app)
            .post('/auth/signup')
            .send({ email: 'weak@example.com', password: 'short' });

        expect(res.status).toBe(400);
        expect(res.text).toContain('Password must be at least 8 characters long');
    });

    test('POST /auth/login successfully logs in and sets session cookie', async () => {
        await request(app)
            .post('/auth/signup')
            .send({ email: 'login@example.com', password: 'Password123' });

        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'login@example.com', password: 'Password123' });

        expect(res.status).toBe(302);
        expect(res.headers.location).toBe('/dashboard');
        expect(res.headers['set-cookie']).toBeDefined();
    });

    test('POST /auth/login rejects incorrect password', async () => {
        await request(app)
            .post('/auth/signup')
            .send({ email: 'badpass@example.com', password: 'Password123' });

        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'badpass@example.com', password: 'WrongPassword999' });

        expect(res.status).toBe(401);
        expect(res.text).toContain('Invalid email or password');
    });

    test('POST with x-enforce-csrf rejects request missing valid token with 403', async () => {
        const res = await request(app)
            .post('/auth/login')
            .set('x-enforce-csrf', 'true')
            .send({ email: 'test@example.com', password: 'Password123' });

        expect(res.status).toBe(403);
    });

    test('GET /auth/logout destroys session and redirects to login', async () => {
        const agent = request.agent(app);
        await agent
            .post('/auth/signup')
            .send({ email: 'logout@example.com', password: 'Password123' });

        await agent
            .post('/auth/login')
            .send({ email: 'logout@example.com', password: 'Password123' });

        const logoutRes = await agent.get('/auth/logout');
        expect(logoutRes.status).toBe(302);
        expect(logoutRes.headers.location).toBe('/auth/login');

        // Trying to access dashboard after logout should redirect to login
        const dashRes = await agent.get('/dashboard');
        expect(dashRes.status).toBe(302);
        expect(dashRes.headers.location).toBe('/auth/login');
    });
});
