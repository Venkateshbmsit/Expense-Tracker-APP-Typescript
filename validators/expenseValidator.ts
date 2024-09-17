import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Schema for adding/editing expenses
const expenseSchema = Joi.object({
    amount: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be a positive number',
        'any.required': 'Amount is required',
    }),
    category_id: Joi.string().required().messages({
        'any.required': 'Category ID is required',
    }),
    date: Joi.date().required().messages({
        'any.required': 'Date is required',
    }),
    notes: Joi.string().trim().required().messages({
        'string.empty': 'Notes are required',
    }),
    paymentMethod: Joi.string().trim().required().messages({
        'string.empty': 'Payment Method is required',
    }),
});

// Schema for querying expenses
const getExpensesSchema = Joi.object({
    startDate: Joi.date().optional().messages({
        'date.base': 'Start date must be a valid date',
    }),
    endDate: Joi.date().optional().messages({
        'date.base': 'End date must be a valid date',
    }),
    category: Joi.number().integer().optional().messages({
        'number.base': 'Category must be a number',
        'number.integer': 'Category must be an integer',
    }),
});

// Type definition for the validated expense
interface ValidatedExpense {
    amount: number;
    category_id: string;
    date: Date;
    notes: string;
    paymentMethod: string;
}

const validateExpense = (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = expenseSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    req.body = value; // Assign the validated data to `req.body` for the next middleware/controller
    next(); // Proceed to the next middleware or route handler
};

const validateGetExpensesQuery = (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = getExpensesSchema.validate(req.query);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    (req as any).validatedQuery = value;
    next(); // Proceed to the next middleware or route handler
};

export { expenseSchema, validateExpense, ValidatedExpense, getExpensesSchema, validateGetExpensesQuery };
