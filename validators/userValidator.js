"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Register validation schema
exports.registerSchema = joi_1.default.object({
    username: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Username is required',
    }),
    email: joi_1.default.string().email().required().regex(/@gmail\.com$/).messages({
        'string.email': 'Email must be a valid email address',
        'string.pattern.base': 'Email must end with @gmail.com',
    }),
    password: joi_1.default.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.empty': 'Password is required',
    }),
});
// Login validation schema
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required',
    }),
    password: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Password is required',
    }),
});
// Update profile validation schema
exports.updateProfileSchema = joi_1.default.object({
    username: joi_1.default.string().min(1).optional().messages({
        'string.empty': 'Username cannot be empty',
    }),
    email: joi_1.default.string().email().optional().messages({
        'string.email': 'Email must be a valid email address',
    }),
});
// Change password validation schema
exports.changePasswordSchema = joi_1.default.object({
    oldPassword: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Old password is required',
    }),
    newPassword: joi_1.default.string().min(8).required().messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.empty': 'New password is required',
    }),
});
