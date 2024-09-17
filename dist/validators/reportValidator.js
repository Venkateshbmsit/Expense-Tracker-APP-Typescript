"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Report validation schema
exports.reportSchema = joi_1.default.object({
    startDate: joi_1.default.date().iso().required().messages({
        'date.base': 'Start date must be a valid ISO date',
        'any.required': 'Start date is required',
    }),
    endDate: joi_1.default.date().iso().required().messages({
        'date.base': 'End date must be a valid ISO date',
        'any.required': 'End date is required',
    }),
});
