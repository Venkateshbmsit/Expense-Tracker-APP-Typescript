import Joi from 'joi';

export const recurringExpenseSchema = Joi.object({
    amount: Joi.number().required().messages({
        'number.base': 'Amount must be a number',
        'any.required': 'Amount is required'
    }),
    categoryId: Joi.number().integer().required().messages({
        'number.base': 'Category ID must be a number',
        'number.integer': 'Category ID must be an integer',
        'any.required': 'Category ID is required'
    }),
    frequency: Joi.string().valid('daily', 'weekly', 'monthly').required().messages({
        'string.base': 'Frequency must be a string',
        'any.only': 'Frequency must be one of daily, weekly, or monthly',
        'any.required': 'Frequency is required'
    }),
    startDate: Joi.date().required().messages({
        'date.base': 'Start date must be a valid date',
        'any.required': 'Start date is required'
    }),
    endDate: Joi.date().optional().messages({
        'date.base': 'End date must be a valid date'
    })
});
