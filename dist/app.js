"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const userController_1 = require("./controllers/userController");
const expenseController_1 = require("./controllers/expenseController");
const categoryController_1 = require("./controllers/categoryController");
const budgetController_1 = require("./controllers/budgetController");
const authenticateToken_1 = __importDefault(require("./middlewares/authenticateToken"));
const expenseValidator_1 = require("./validators/expenseValidator");
const reportController_1 = require("./controllers/reportController");
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
// User Routes
app.post('/api/users/register', userController_1.register);
app.post('/api/users/login', userController_1.login);
app.put('/update-profile', authenticateToken_1.default, userController_1.updateProfile);
app.put('/api/users/password', authenticateToken_1.default, userController_1.changePassword);
// Expense Routes
app.post('/api/expenses', authenticateToken_1.default, expenseValidator_1.validateExpense, expenseController_1.addExpense);
app.put('/api/expenses/:id', authenticateToken_1.default, expenseValidator_1.validateExpense, expenseController_1.editExpense);
app.delete('/api/expenses/:id', authenticateToken_1.default, expenseController_1.deleteExpense);
app.get('/api/expenses', authenticateToken_1.default, expenseValidator_1.validateGetExpensesQuery, expenseController_1.getExpenses);
// Category Routes
// Category Routes
app.post('/api/categories', authenticateToken_1.default, categoryController_1.addCategory); // Add authenticateToken here
app.put('/api/categories/:id', authenticateToken_1.default, categoryController_1.editCategory); // Add authenticateToken here
app.delete('/api/categories/:id', authenticateToken_1.default, categoryController_1.deleteCategory); // Add authenticateToken here
app.get('/api/categories', authenticateToken_1.default, categoryController_1.getCategories); // Add authenticateToken here
// Budget Routes
// Budget Routes
app.post('/api/budget/set', authenticateToken_1.default, budgetController_1.setBudget); // Add the setBudget route
app.get('/api/budget/track', authenticateToken_1.default, budgetController_1.trackBudget); // Add authentication to trackBudget
app.get('/api/reports/generate', authenticateToken_1.default, reportController_1.generateReport);
// Error Handling Middleware
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
