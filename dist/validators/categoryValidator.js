"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorySchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.categorySchema = joi_1.default.object({
    name: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Category name is required',
        'string.min': 'Category name must not be empty',
    }),
    icon: joi_1.default.string().min(1).required().messages({
        'string.empty': 'Category icon is required',
        'string.min': 'Category icon must not be empty',
    }),
});
