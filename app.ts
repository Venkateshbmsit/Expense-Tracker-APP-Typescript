import dotenv from 'dotenv';
dotenv.config();


import express, { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import { register, login, updateProfile, changePassword } from './controllers/userController';
import { addExpense, editExpense, deleteExpense, getExpenses} from './controllers/expenseController';
import { addCategory, editCategory, deleteCategory, getCategories } from './controllers/categoryController';
import { setBudget, trackBudget } from './controllers/budgetController';
import expenseRoutes from './routes/expense';
import authenticateToken from './middlewares/authenticateToken';
import { validateExpense, validateGetExpensesQuery } from './validators/expenseValidator';
import { generateReport } from './controllers/reportController';

const app = express();
app.use(json());



// User Routes
app.post('/api/users/register', register);
app.post('/api/users/login', login);
app.put('/update-profile', authenticateToken,updateProfile); 
app.put('/api/users/password', authenticateToken,changePassword);

// Expense Routes
app.post('/api/expenses', authenticateToken, validateExpense, addExpense);
app.put('/api/expenses/:id', authenticateToken, validateExpense, editExpense);
app.delete('/api/expenses/:id', authenticateToken, deleteExpense);
app.get('/api/expenses', authenticateToken, validateGetExpensesQuery, getExpenses);

// Category Routes
// Category Routes
app.post('/api/categories', authenticateToken, addCategory); // Add authenticateToken here
app.put('/api/categories/:id', authenticateToken, editCategory); // Add authenticateToken here
app.delete('/api/categories/:id', authenticateToken, deleteCategory); // Add authenticateToken here
app.get('/api/categories', authenticateToken, getCategories); // Add authenticateToken here


// Budget Routes

// Budget Routes
app.post('/api/budget/set', authenticateToken, setBudget); // Add the setBudget route
app.get('/api/budget/track', authenticateToken, trackBudget); // Add authentication to trackBudget

app.get('/api/reports/generate', authenticateToken, generateReport);
// Error Handling Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({ message: 'Not Found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
