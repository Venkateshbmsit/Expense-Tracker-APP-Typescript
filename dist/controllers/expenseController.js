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
exports.addRecurringExpense = exports.getExpenses = exports.deleteExpense = exports.editExpense = exports.addExpense = void 0;
const db_1 = __importDefault(require("../utils/db"));
const expenseValidator_1 = require("../validators/expenseValidator");
const recurringExpenseValidator_1 = require("../validators/recurringExpenseValidator");
const addExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }
    const { amount, category_id, date, notes, paymentMethod } = req.body;
    if (!amount || !category_id || !date) {
        return res.status(400).json({ message: 'Amount, category_id, and date are required' });
    }
    try {
        // Start a transaction to ensure consistency
        yield db_1.default.query('START TRANSACTION');
        // Get the user's budget
        const [budgetRows] = yield db_1.default.query('SELECT amount FROM budgets WHERE user_id = ?', [userId]);
        if (budgetRows.length === 0) {
            yield db_1.default.query('ROLLBACK');
            return res.status(404).json({ message: 'Budget not found for the user' });
        }
        const budget = budgetRows[0].amount;
        // Get the total expenses for the user
        const [expenseRows] = yield db_1.default.query('SELECT COALESCE(SUM(amount), 0) AS total_expenses FROM expenses WHERE user_id = ?', [userId]);
        const totalExpenses = ((_b = expenseRows[0]) === null || _b === void 0 ? void 0 : _b.total_expenses) || 0;
        // Calculate the total expenses including the new expense
        const newTotalExpenses = totalExpenses + amount;
        // Check if the new total expenses exceed the budget
        if (newTotalExpenses > budget) {
            yield db_1.default.query('ROLLBACK');
            return res.status(400).json({ message: 'Expense exceeds the budget limit' });
        }
        // Insert the new expense
        yield db_1.default.query('INSERT INTO expenses (amount, category_id, user_id, date, notes, payment_method) VALUES (?, ?, ?, ?, ?, ?)', [amount, category_id, userId, date, notes, paymentMethod]);
        // Commit the transaction
        yield db_1.default.query('COMMIT');
        return res.status(201).json({ message: 'Expense added successfully' });
    }
    catch (error) {
        // Rollback transaction in case of error
        yield db_1.default.query('ROLLBACK');
        console.error('Error adding expense:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});
exports.addExpense = addExpense;
// Edit Expense
const editExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { error, value } = expenseValidator_1.expenseSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { amount, category_id, date, notes, paymentMethod } = value;
    const expenseId = req.params.id;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    console.log('userId:', userId, 'expenseId:', expenseId);
    try {
        const [expenseCheck] = yield db_1.default.query('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [expenseId, userId]);
        if (expenseCheck.length === 0) {
            console.log('No expense found for user:', userId, 'with expenseId:', expenseId); // Debugging
            return res.status(404).json({ message: 'Expense not found or you do not have permission to edit this expense' });
        }
        const [result] = yield db_1.default.query('UPDATE expenses SET amount = ?, category_id = ?, date = ?, notes = ?, payment_method = ? WHERE id = ? AND user_id = ?', [amount, category_id, date, notes, paymentMethod, expenseId, userId]);
        return res.json({ message: 'Expense updated successfully' });
    }
    catch (error) {
        console.error('Edit expense error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});
exports.editExpense = editExpense;
// Delete Expense
const deleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const [expenseCheck] = yield db_1.default.query('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
        if (expenseCheck.length === 0) {
            return res.status(404).json({ message: 'Expense not found or you do not have permission to delete this expense' });
        }
        // Delete the expense
        const [result] = yield db_1.default.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
        return res.json({
            message: 'Expense deleted successfully',
            deletedExpense: expenseCheck[0]
        });
    }
    catch (error) {
        console.error('Delete expense error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});
exports.deleteExpense = deleteExpense;
const getExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { error, value } = expenseValidator_1.getExpensesSchema.validate(req.query);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { startDate, endDate, category } = value;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params = [userId];
    if (startDate && endDate) {
        query += ' AND date BETWEEN ? AND ?';
        params.push(startDate, endDate);
    }
    if (category) {
        query += ' AND category_id = ?';
        params.push(category);
    }
    try {
        const [rows] = yield db_1.default.query(query, params);
        return res.json(rows);
    }
    catch (error) {
        console.error('Retrieve expenses error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});
exports.getExpenses = getExpenses;
// Add Recurring Expense
const addRecurringExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { error, value } = recurringExpenseValidator_1.recurringExpenseSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { amount, categoryId, frequency, startDate, endDate } = value;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        const [result] = yield db_1.default.query('INSERT INTO recurring_expenses (user_id, amount, category_id, frequency, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)', [userId, amount, categoryId, frequency, startDate, endDate]);
        return res.status(201).json({ message: 'Recurring expense added successfully' });
    }
    catch (error) {
        console.error('Add recurring expense error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
});
exports.addRecurringExpense = addRecurringExpense;
