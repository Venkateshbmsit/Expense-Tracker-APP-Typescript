"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGetExpensesQuery = exports.getExpensesSchema = exports.validateExpense = exports.expenseSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Schema for adding/editing expenses
const expenseSchema = joi_1.default.object({
    amount: joi_1.default.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be a positive number',
        'any.required': 'Amount is required',
    }),
    category_id: joi_1.default.string().required().messages({
        'any.required': 'Category ID is required',
    }),
    date: joi_1.default.date().required().messages({
        'any.required': 'Date is required',
    }),
    notes: joi_1.default.string().trim().required().messages({
        'string.empty': 'Notes are required',
    }),
    paymentMethod: joi_1.default.string().trim().required().messages({
        'string.empty': 'Payment Method is required',
    }),
});
exports.expenseSchema = expenseSchema;
// Schema for querying expenses
const getExpensesSchema = joi_1.default.object({
    startDate: joi_1.default.date().optional().messages({
        'date.base': 'Start date must be a valid date',
    }),
    endDate: joi_1.default.date().optional().messages({
        'date.base': 'End date must be a valid date',
    }),
    category: joi_1.default.number().integer().optional().messages({
        'number.base': 'Category must be a number',
        'number.integer': 'Category must be an integer',
    }),
});
exports.getExpensesSchema = getExpensesSchema;
const validateExpense = (req, res, next) => {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    req.body = value; // Assign the validated data to `req.body` for the next middleware/controller
    next(); // Proceed to the next middleware or route handler
};
exports.validateExpense = validateExpense;
const validateGetExpensesQuery = (req, res, next) => {
    const { error, value } = getExpensesSchema.validate(req.query);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    req.validatedQuery = value;
    next(); // Proceed to the next middleware or route handler
};
exports.validateGetExpensesQuery = validateGetExpensesQuery;
