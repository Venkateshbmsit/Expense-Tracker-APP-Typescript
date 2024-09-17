import express from 'express';
import authenticateToken from '../middlewares/authenticateToken';
import { validateExpense } from '../validators/expenseValidator'; 
import {
    addExpense,
    editExpense,
    deleteExpense,
    getExpenses,
    addRecurringExpense
} from '../controllers/expenseController';

const router = express.Router();

// Define the routes
router.post('/', authenticateToken, validateExpense, addExpense); 
router.put('/:id', authenticateToken, validateExpense, editExpense); 
router.delete('/:id', authenticateToken, deleteExpense);
router.get('/', authenticateToken, getExpenses);
router.post('/recurring-expense', authenticateToken, addRecurringExpense);

export default router;
