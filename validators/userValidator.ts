import Joi, { ObjectSchema } from 'joi';

// Register validation schema
export const registerSchema: ObjectSchema = Joi.object({
    username: Joi.string().min(4).required().messages({
        'string.empty': 'Username is required',
        'string.min': 'Username must have at least 4 character',
    }),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .regex(/@gmail\.com$/) // Optional: only allow Gmail addresses
        .messages({
            'string.email': 'Email must be a valid email address',
            'string.pattern.base': 'Email must end with @gmail.com',
            'string.empty': 'Email is required',
        }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.empty': 'Password is required',
    }),
});

// Login validation schema
export const loginSchema: ObjectSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } }) // To allow non-standard domains if needed
        .trim()
        .required()
        .messages({
            'string.email': 'Email must be a valid email address',
            'string.empty': 'Email is required',
        }),
    password: Joi.string()
        .min(6)  // You can adjust this minimum length as per your requirement
        .max(30) // Optional: Set a maximum length
        .trim()
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.max': 'Password must not exceed 30 characters',
            'string.empty': 'Password is required',
        }),
});

// Update profile validation schema
export const updateProfileSchema: ObjectSchema = Joi.object({
    username: Joi.string().min(1).optional().messages({
        'string.empty': 'Username cannot be empty',
        'string.min': 'Username must have at least 1 character',
    }),
    email: Joi.string().email().optional().messages({
        'string.email': 'Email must be a valid email address',
    }),
    profile_picture: Joi.string().optional().messages({
        'string.base': 'Profile picture must be a string',
    }),
});

// Change password validation schema
export const changePasswordSchema: ObjectSchema = Joi.object({
    oldPassword: Joi.string().min(1).required().messages({
        'string.empty': 'Old password is required',
        'string.min': 'Old password cannot be empty',
    }),
    newPassword: Joi.string().min(8).required().messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.empty': 'New password is required',
    }),
});
