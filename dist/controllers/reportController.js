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
exports.generateReport = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const db_1 = __importDefault(require("../utils/db"));
const generateReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { startDate, endDate } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Get the userId from the authenticated request
        // Validate the inputs
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start date and end date are required' });
        }
        if (!userId) {
            return res.status(403).json({ message: 'Unauthorized user' });
        }
        // Fetch the user's budget from the budget table
        const [budgetResult] = yield db_1.default.query('SELECT amount FROM budgets WHERE user_id = ?', [userId]); // Type assertion
        if (budgetResult.length === 0) {
            return res.status(404).json({ message: 'Budget not found for the user' });
        }
        const userBudget = (_c = (_b = budgetResult[0]) === null || _b === void 0 ? void 0 : _b.amount) !== null && _c !== void 0 ? _c : 0;
        // Fetch report data from the database based on userId, startDate, and endDate
        const [rows] = yield db_1.default.query('SELECT id, amount, date, notes, category_id FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?', [userId, startDate, endDate]); // Type assertion
        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'No expenses found for the given date range' });
        }
        // Calculate the total expenses
        const totalExpenses = rows.reduce((total, expense) => total + parseFloat(expense.amount), 0).toFixed(2);
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
        const filePath = path_1.default.join(__dirname, 'report.pdf');
        // Create a new PDF document
        const doc = new pdfkit_1.default();
        const writeStream = fs_1.default.createWriteStream(filePath);
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
            fs_1.default.stat(filePath, (err, stats) => {
                if (err) {
                    return res.status(500).json({ message: 'Error generating the PDF' });
                }
                res.sendFile(filePath, () => {
                    // Remove the temporary file after sending it
                    fs_1.default.unlink(filePath, (unlinkErr) => {
                        if (unlinkErr)
                            console.error('Error deleting the temporary PDF file:', unlinkErr);
                    });
                });
            });
        });
    }
    catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
exports.generateReport = generateReport;
