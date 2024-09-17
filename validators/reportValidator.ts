import Joi, { ObjectSchema } from 'joi';

// Report validation schema
export const reportSchema: ObjectSchema = Joi.object({
    startDate: Joi.date().iso().required().messages({
        'date.base': 'Start date must be a valid ISO date',
        'any.required': 'Start date is required',
    }),
    endDate: Joi.date().iso().required().messages({
        'date.base': 'End date must be a valid ISO date',
        'any.required': 'End date is required',
    }),
});
