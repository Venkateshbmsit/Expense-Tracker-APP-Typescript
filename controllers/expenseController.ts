import { Request, Response } from 'express';
import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../utils/db';
import { expenseSchema, getExpensesSchema } from '../validators/expenseValidator'; 
import { recurringExpenseSchema } from '../validators/recurringExpenseValidator';

interface AuthenticatedRequest extends Request {
    user?: { userId: number; email: string };
}

export const addExpense = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
    }

    const { amount, category_id, date, notes, paymentMethod } = req.body;

    if (!amount || !category_id || !date) {
        return res.status(400).json({ message: 'Amount, category_id, and date are required' });
    }

    try {
        // Start a transaction to ensure consistency
        await pool.query('START TRANSACTION');

        // Get the user's budget
        const [budgetRows] = await pool.query(
            'SELECT amount FROM budgets WHERE user_id = ?',
            [userId]
        ) as [any[], any];

        if (budgetRows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Budget not found for the user' });
        }

        const budget = budgetRows[0].amount;

        // Get the total expenses for the user
        const [expenseRows] = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) AS total_expenses FROM expenses WHERE user_id = ?',
            [userId]
        ) as [any[], any];

        const totalExpenses = expenseRows[0]?.total_expenses || 0;

        // Calculate the total expenses including the new expense
        const newTotalExpenses = totalExpenses + amount;

        // Check if the new total expenses exceed the budget
        if (newTotalExpenses > budget) {
            await pool.query('ROLLBACK');
            return res.status(400).json({ message: 'Expense exceeds the budget limit' });
        }

        // Insert the new expense
        await pool.query(
            'INSERT INTO expenses (amount, category_id, user_id, date, notes, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
            [amount, category_id, userId, date, notes, paymentMethod]
        );

        // Commit the transaction
        await pool.query('COMMIT');

        return res.status(201).json({ message: 'Expense added successfully' });
    } catch (error) {
        // Rollback transaction in case of error
        await pool.query('ROLLBACK');
        console.error('Error adding expense:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};



// Edit Expense
export const editExpense = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const { error, value } = expenseSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { amount, category_id, date, notes, paymentMethod } = value;
    const expenseId = req.params.id;
    const userId = req.user?.userId;

 
    console.log('userId:', userId, 'expenseId:', expenseId);

    try {
       
        const [expenseCheck]: [RowDataPacket[], any] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
            [expenseId, userId]
        );

      
        if (expenseCheck.length === 0) {
            console.log('No expense found for user:', userId, 'with expenseId:', expenseId); // Debugging
            return res.status(404).json({ message: 'Expense not found or you do not have permission to edit this expense' });
        }

       
        const [result]: [ResultSetHeader, any] = await pool.query<ResultSetHeader>(
            'UPDATE expenses SET amount = ?, category_id = ?, date = ?, notes = ?, payment_method = ? WHERE id = ? AND user_id = ?',
            [amount, category_id, date, notes, paymentMethod, expenseId, userId]
        );

        return res.json({ message: 'Expense updated successfully' });
    } catch (error) {
        console.error('Edit expense error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};



// Delete Expense
export const deleteExpense = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const { id } = req.params;
    const userId = req.user?.userId;

    try {
       
        const [expenseCheck]: [RowDataPacket[], any] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (expenseCheck.length === 0) {
            return res.status(404).json({ message: 'Expense not found or you do not have permission to delete this expense' });
        }

        // Delete the expense
        const [result]: [ResultSetHeader, any] = await pool.query<ResultSetHeader>(
            'DELETE FROM expenses WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        return res.json({
            message: 'Expense deleted successfully',
            deletedExpense: expenseCheck[0]
        });
    } catch (error) {
        console.error('Delete expense error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};


export const getExpenses = async (req: Request, res: Response): Promise<Response> => {
    const { error, value } = getExpensesSchema.validate(req.query);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { startDate, endDate, category } = value;
    const userId = req.user?.userId;

    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params: any[] = [userId];

    if (startDate && endDate) {
        query += ' AND date BETWEEN ? AND ?';
        params.push(startDate, endDate);
    }

    if (category) {
        query += ' AND category_id = ?';
        params.push(category);
    }

    try {
        const [rows]: [RowDataPacket[], any] = await pool.query<RowDataPacket[]>(query, params);
        return res.json(rows);
    } catch (error) {
        console.error('Retrieve expenses error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};


// Add Recurring Expense
export const addRecurringExpense = async (req: Request, res: Response): Promise<Response> => {
    const { error, value } = recurringExpenseSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { amount, categoryId, frequency, startDate, endDate } = value;
    const userId = req.user?.userId;

    try {
        const [result]: [ResultSetHeader, any] = await pool.query<ResultSetHeader>(
            'INSERT INTO recurring_expenses (user_id, amount, category_id, frequency, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, amount, categoryId, frequency, startDate, endDate]
        );

        return res.status(201).json({ message: 'Recurring expense added successfully' });
    } catch (error) {
        console.error('Add recurring expense error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
