import { Request, Response, NextFunction } from 'express';
import pool from '../utils/db'; 
import { RowDataPacket } from 'mysql2';

interface Budget extends RowDataPacket {
    category_id: number;
    amount: number;
    time_period: string;
    start_date: string;
    end_date: string;
    user_id: number;
}

interface Expense extends RowDataPacket {
    total_spent: number;
}

interface AuthenticatedRequest extends Request {
    user?: { userId: number; email: string };
}


export const setBudget = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
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
    if (!timePeriod || !validPeriods.includes((timePeriod as string).toLowerCase())) {
        res.status(400).json({ message: `Valid time period is required (${validPeriods.join(', ')})` });
        return;
    }
    if (!startDate || !endDate) {
        res.status(400).json({ message: 'Both start date and end date are required' });
        return;
    }

    try {
        
        const [existingBudget]: any = await pool.query(
            'SELECT * FROM budgets WHERE user_id = ? AND category_id = ? AND time_period = ?',
            [userId, categoryId, timePeriod]
        );

        if (existingBudget.length > 0) {
         
            await pool.query(
                'UPDATE budgets SET amount = ?, start_date = ?, end_date = ? WHERE user_id = ? AND category_id = ? AND time_period = ?',
                [amount, startDate, endDate, userId, categoryId, timePeriod]
            );
            res.json({ message: 'Budget updated successfully' });
        } else {
         
            await pool.query(
                'INSERT INTO budgets (user_id, category_id, amount, time_period, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, categoryId, amount, timePeriod, startDate, endDate]
            );
            res.json({ message: 'Budget set successfully' });
        }
    } catch (error) {
        console.error('Set budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const trackBudget = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;
    const { categoryId, timePeriod } = req.query;

    if (!categoryId || isNaN(Number(categoryId))) {
        res.status(400).json({ message: 'Valid category ID is required' });
        return;
    }

    const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
    if (!timePeriod || !validPeriods.includes((timePeriod as string).toLowerCase())) {
        res.status(400).json({ message: `Valid time period is required (${validPeriods.join(', ')})` });
        return;
    }

    try {
      
        const [budgets] = await pool.query(
            'SELECT * FROM budgets WHERE user_id = ? AND category_id = ? AND time_period = ?',
            [userId, categoryId, timePeriod]
        ) as unknown as [Budget[]];

        if (budgets.length === 0) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }

        const budget = budgets[0];

       
        const [expenses] = await pool.query(
            'SELECT SUM(amount) AS total_spent FROM expenses WHERE user_id = ? AND category_id = ? AND DATE(date) BETWEEN ? AND ?',
            [userId, categoryId, budget.start_date, budget.end_date]
        ) as unknown as [Expense[]];

        const totalSpent = expenses[0]?.total_spent || 0;
        const remainingBudget = budget.amount - totalSpent;

        res.json({
            categoryId,
            timePeriod,
            budget: budget.amount,
            spent: totalSpent,
            remaining: remainingBudget
        });
    } catch (error) {
        console.error('Track budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};