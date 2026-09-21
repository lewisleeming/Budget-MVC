'use strict';

/**
 * Format a number as currency (defaults to GBP £)
 */
function formatCurrency(amount, currency = 'GBP', locale = 'en-GB') {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

/**
 * Format a date to readable string (e.g. 19 Sep 2026)
 */
function formatDate(date, locale = 'en-GB') {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).format(d);
}

/**
 * Format a date as YYYY-MM-DD for HTML input[type="date"]
 */
function formatDateForInput(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
}

/**
 * Get current year-month as YYYY-MM (e.g. 2026-09)
 */
function getCurrentMonthString(date = new Date()) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

/**
 * Get start and end Date objects for a given YYYY-MM string
 */
function getMonthDateRange(monthStr) {
    if (!monthStr || !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthStr)) {
        monthStr = getCurrentMonthString();
    }
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    // Day 0 of next month is the last day of current month
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return { startDate, endDate, month: monthStr };
}

/**
 * Calculate the number of remaining days in the month, including today.
 * If the month is in the past, returns 0.
 * If the month is in the future, returns total days in that month.
 */
function getRemainingDaysInMonth(monthStr, now = new Date()) {
    const currentMonth = getCurrentMonthString(now);
    const [year, month] = (monthStr || currentMonth).split('-').map(Number);
    const totalDays = new Date(year, month, 0).getDate();

    if (monthStr < currentMonth) {
        return 0; // past month
    }
    if (monthStr > currentMonth) {
        return totalDays; // future month
    }
    // Current month: days remaining including today
    const currentDay = now.getDate();
    return Math.max(1, totalDays - currentDay + 1);
}

module.exports = {
    formatCurrency,
    formatDate,
    formatDateForInput,
    getCurrentMonthString,
    getMonthDateRange,
    getRemainingDaysInMonth
};
