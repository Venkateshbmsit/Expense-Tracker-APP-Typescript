import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import pool from '../utils/db';

interface AuthenticatedRequest extends Request {
    user?: { userId: number; email: string };
}

export const generateReport = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { startDate, endDate } = req.body;
        const userId = req.user?.userId; // Get the userId from the authenticated request

        // Validate the inputs
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }

        if (!userId) {
            return res.status(403).json({ message: 'Unauthorized user' });
        }

        // Fetch the user's budget from the budget table
        const [budgetResult] = await pool.query(
            'SELECT amount FROM budgets WHERE user_id = ?',
            [userId]
        ) as [Array<{ amount: number }>, any]; // Type assertion

        if (budgetResult.length === 0) {
            return res.status(404).json({ message: 'Budget not found for the user' });
        }

        const userBudget = budgetResult[0]?.amount ?? 0;

        // Fetch report data from the database based on userId, startDate, and endDate
        const [rows] = await pool.query(
            'SELECT id, amount, date, notes, category_id FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?',
            [userId, startDate, endDate]
        ) as [Array<{ id: number; amount: string; date: string; notes: string; category_id: number }>, any]; // Type assertion

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'No expenses found for the given date range' });
        }

        // Calculate the total expenses
        const totalExpenses = rows.reduce((total: number, expense) => total + parseFloat(expense.amount), 0).toFixed(2);

        // Check if total expenses exceed the user's budget
        if (parseFloat(totalExpenses) > userBudget) {
            return res.status(400).json({ message: 'Total expenses exceed the user\'s budget' });
        }

        // Map the report data
        const reportData = {
            userId: userId,
            startDate: startDate,
            endDate: endDate,
            totalExpenses: totalExpenses,
            expenses: rows.map(expense => ({
                id: expense.id,
                amount: expense.amount,
                date: expense.date,
                notes: expense.notes,
                category: expense.category_id // Replace with category name if necessary
            }))
        };

        // Define the path for the PDF file
        const filePath = path.join(__dirname, 'report.pdf');

        // Create a new PDF document
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add content to the PDF
        doc.fontSize(16).text(`Report for User ID ${reportData.userId}`, {
            align: 'center',
            underline: true
        });

        doc.fontSize(14).text(`Report from ${reportData.startDate} to ${reportData.endDate}`, {
            align: 'center',
            underline: true
        });

        doc.fontSize(12).text(`Total Expenses: ${reportData.totalExpenses}`, {
            align: 'left'
        });

        doc.moveDown();

        reportData.expenses.forEach(expense => {
            doc.text(`ID: ${expense.id}`);
            doc.text(`Amount: ${expense.amount}`);
            doc.text(`Date: ${new Date(expense.date).toLocaleDateString()}`);
            doc.text(`Notes: ${expense.notes}`);
            doc.text(`Category: ${expense.category}`);
            doc.moveDown();
        });

        doc.end();

        // Wait for the PDF to be created and then send it
        writeStream.on('finish', () => {
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    return res.status(500).json({ message: 'Error generating the PDF' });
                }
                res.sendFile(filePath, () => {
                    // Remove the temporary file after sending it
                    fs.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr) console.error('Error deleting the temporary PDF file:', unlinkErr);
                    });
                });
            });
        });

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
