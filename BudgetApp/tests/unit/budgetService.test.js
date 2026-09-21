'use strict';

const { calculateSafeToSpend, calculatePercentageUsed } = require('../../services/budgetService');

const {
    formatCurrency,
    formatDate,
    getMonthDateRange,
    getRemainingDaysInMonth
} = require('../../utils/formatters');

const { validatePassword, validateEmail } = require('../../services/authService');

describe('Unit Tests: Financial & Budget Calculations', () => {
    describe('calculateSafeToSpend', () => {
        test('calculates safe-to-spend correctly with positive budget and remaining days', () => {
            expect(calculateSafeToSpend(300, 10)).toBe(30);
            expect(calculateSafeToSpend(100, 3)).toBe(33.33);
        });

        test('returns 0 when remaining budget is zero or negative', () => {
            expect(calculateSafeToSpend(0, 10)).toBe(0);
            expect(calculateSafeToSpend(-50, 10)).toBe(0);
        });

        test('returns 0 when remaining days is zero or negative', () => {
            expect(calculateSafeToSpend(300, 0)).toBe(0);
            expect(calculateSafeToSpend(300, -2)).toBe(0);
        });
    });

    describe('calculatePercentageUsed', () => {
        test('calculates percentage correctly under budget', () => {
            expect(calculatePercentageUsed(250, 1000)).toBe(25.0);
            expect(calculatePercentageUsed(500, 1000)).toBe(50.0);
        });

        test('calculates percentage correctly over budget (>100%)', () => {
            expect(calculatePercentageUsed(1200, 1000)).toBe(120.0);
        });

        test('handles zero budget safely', () => {
            expect(calculatePercentageUsed(0, 0)).toBe(0);
            expect(calculatePercentageUsed(50, 0)).toBe(100);
        });
    });

    describe('formatters', () => {
        test('formatCurrency formats to GBP by default', () => {
            const formatted = formatCurrency(1250.5);
            expect(formatted).toContain('1,250.50');
            expect(formatted).toContain('£');
        });

        test('formatDate formats to readable UK date', () => {
            const date = new Date(Date.UTC(2026, 8, 19)); // Sep 19, 2026
            const formatted = formatDate(date);
            expect(formatted).toContain('19');
            expect(formatted).toContain('Sep');
            expect(formatted).toContain('2026');
        });

        test('getMonthDateRange returns valid start and end boundaries', () => {
            const { startDate, endDate } = getMonthDateRange('2026-02');
            expect(startDate.getUTCFullYear()).toBe(2026);
            expect(startDate.getUTCMonth()).toBe(1); // February (0-indexed)
            expect(startDate.getUTCDate()).toBe(1);

            // February 2026 has 28 days
            expect(endDate.getUTCDate()).toBe(28);
        });

        test('getRemainingDaysInMonth returns 0 for past months', () => {
            const days = getRemainingDaysInMonth('2020-01', new Date('2026-09-19'));
            expect(days).toBe(0);
        });
    });

    describe('authService validators', () => {
        test('validatePassword validates length and complexity', () => {
            expect(validatePassword('short1').isValid).toBe(false);
            expect(validatePassword('nouppercaseornumber').isValid).toBe(false);
            expect(validatePassword('12345678').isValid).toBe(false);
            expect(validatePassword('ValidPass123').isValid).toBe(true);
        });

        test('validateEmail validates valid and invalid formats', () => {
            expect(validateEmail('invalid').isValid).toBe(false);
            expect(validateEmail('test@').isValid).toBe(false);
            expect(validateEmail('user@example.com').isValid).toBe(true);
        });
    });
});
