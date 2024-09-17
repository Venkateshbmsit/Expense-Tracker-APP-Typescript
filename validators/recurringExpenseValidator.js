"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recurringExpenseSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.recurringExpenseSchema = joi_1.default.object({
    amount: joi_1.default.number().required().messages({
        'number.base': 'Amount must be a number',
        'any.required': 'Amount is required'
    }),
    categoryId: joi_1.default.number().integer().required().messages({
        'number.base': 'Category ID must be a number',
        'number.integer': 'Category ID must be an integer',
        'any.required': 'Category ID is required'
    }),
    frequency: joi_1.default.string().valid('daily', 'weekly', 'monthly').required().messages({
        'string.base': 'Frequency must be a string',
        'any.only': 'Frequency must be one of daily, weekly, or monthly',
        'any.required': 'Frequency is required'
    }),
    startDate: joi_1.default.date().required().messages({
        'date.base': 'Start date must be a valid date',
        'any.required': 'Start date is required'
    }),
    endDate: joi_1.default.date().optional().messages({
        'date.base': 'End date must be a valid date'
    })
});
