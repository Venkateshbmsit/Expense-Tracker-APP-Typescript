"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackBudget = exports.setBudget = void 0;
const db_1 = __importDefault(require("../utils/db"));
const setBudget = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { categoryId, amount, timePeriod, startDate, endDate } = req.body;
    // Validation
    if (!categoryId || isNaN(Number(categoryId))) {
        res.status(400).json({ message: 'Valid category ID is required' });
        return;
    }
    if (!amount || isNaN(Number(amount))) {
        res.status(400).json({ message: 'Valid amount is required' });
        return;
    }
    const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!timePeriod || !validPeriods.includes(timePeriod.toLowerCase())) {
        res.status(400).json({ message: `Valid time period is required (${validPeriods.join(', ')})` });
        return;
    }
    if (!startDate || !endDate) {
        res.status(400).json({ message: 'Both start date and end date are required' });
        return;
    }
    try {
        const [existingBudget] = yield db_1.default.query('SELECT * FROM budgets WHERE user_id = ? AND category_id = ? AND time_period = ?', [userId, categoryId, timePeriod]);
        if (existingBudget.length > 0) {
            yield db_1.default.query('UPDATE budgets SET amount = ?, start_date = ?, end_date = ? WHERE user_id = ? AND category_id = ? AND time_period = ?', [amount, startDate, endDate, userId, categoryId, timePeriod]);
            res.json({ message: 'Budget updated successfully' });
        }
        else {
            yield db_1.default.query('INSERT INTO budgets (user_id, category_id, amount, time_period, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)', [userId, categoryId, amount, timePeriod, startDate, endDate]);
            res.json({ message: 'Budget set successfully' });
        }
    }
    catch (error) {
        console.error('Set budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.setBudget = setBudget;
const trackBudget = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { categoryId, timePeriod } = req.query;
    if (!categoryId || isNaN(Number(categoryId))) {
        res.status(400).json({ message: 'Valid category ID is required' });
        return;
    }
    const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!timePeriod || !validPeriods.includes(timePeriod.toLowerCase())) {
        res.status(400).json({ message: `Valid time period is required (${validPeriods.join(', ')})` });
        return;
    }
    try {
        const [budgets] = yield db_1.default.query('SELECT * FROM budgets WHERE user_id = ? AND category_id = ? AND time_period = ?', [userId, categoryId, timePeriod]);
        if (budgets.length === 0) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }
        const budget = budgets[0];
        const [expenses] = yield db_1.default.query('SELECT SUM(amount) AS total_spent FROM expenses WHERE user_id = ? AND category_id = ? AND DATE(date) BETWEEN ? AND ?', [userId, categoryId, budget.start_date, budget.end_date]);
        const totalSpent = ((_b = expenses[0]) === null || _b === void 0 ? void 0 : _b.total_spent) || 0;
        const remainingBudget = budget.amount - totalSpent;
        res.json({
            categoryId,
            timePeriod,
            budget: budget.amount,
            spent: totalSpent,
            remaining: remainingBudget
        });
    }
    catch (error) {
        console.error('Track budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.trackBudget = trackBudget;
