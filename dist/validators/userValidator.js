"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Register validation schema
exports.registerSchema = joi_1.default.object({
    username: joi_1.default.string().min(4).required().messages({
        'string.empty': 'Username is required',
        'string.min': 'Username must have at least 4 character',
    }),
    email: joi_1.default.string()
        .email({ tlds: { allow: false } })
        .required()
        .regex(/@gmail\.com$/) // Optional: only allow Gmail addresses
        .messages({
        'string.email': 'Email must be a valid email address',
        'string.pattern.base': 'Email must end with @gmail.com',
        'string.empty': 'Email is required',
    }),
    password: joi_1.default.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.empty': 'Password is required',
    }),
});
// Login validation schema
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email({ tlds: { allow: false } }) // To allow non-standard domains if needed
        .trim()
        .required()
        .messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required',
    }),
    password: joi_1.default.string()
        .min(6) // You can adjust this minimum length as per your requirement
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
exports.updateProfileSchema = joi_1.default.object({
    username: joi_1.default.string().min(1).optional().messages({
        'string.empty': 'Username cannot be empty',
        'string.min': 'Username must have at least 1 character',
    }),
    email: joi_1.default.string().email().optional().messages({
        'string.email': 'Email must be a valid email address',
    }),
    profile_picture: joi_1.default.string().optional().messages({
        'string.base': 'Profile picture must be a string',
    }),
});
// Change password validation schema
exports.changePasswordSchema = joi_1.default.object({
    oldPassword: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Old password is required',
        'string.min': 'Old password cannot be empty',
    }),
    newPassword: joi_1.default.string().min(8).required().messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.empty': 'New password is required',
    }),
});
