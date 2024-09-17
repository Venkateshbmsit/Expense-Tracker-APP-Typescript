"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateExpense = exports.expenseSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Expense validation schema
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
const validateExpense = (req, res, next) => {
    const { error, value } = expenseSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    req.body = value; // Assign the validated data to `req.body` for the next middleware/controller
    next(); // Proceed to the next middleware or route handler
};
exports.validateExpense = validateExpense;
