import Joi from 'joi';

export const categorySchema = Joi.object({
    name: Joi.string().min(1).required().messages({
        'string.empty': 'Category name is required',
        'string.min': 'Category name must not be empty',
    }),
    icon: Joi.string().min(1).required().messages({
        'string.empty': 'Category icon is required',
        'string.min': 'Category icon must not be empty',
    }),
});
