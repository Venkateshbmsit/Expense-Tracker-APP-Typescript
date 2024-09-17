"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.deleteCategory = exports.editCategory = exports.addCategory = void 0;
const db_1 = __importDefault(require("../utils/db"));
const categoryValidator_1 = require("../validators/categoryValidator");
// Add new category
const addCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    const { error, value } = categoryValidator_1.categorySchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { name, icon } = value;
    try {
        const [result] = yield db_1.default.query('INSERT INTO categories (name, icon, user_id) VALUES (?, ?, ?)', [name, icon, userId]);
        res.status(201).json({ message: 'Category added successfully', categoryId: result.insertId });
    }
    catch (error) {
        console.error('Add category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.addCategory = addCategory;
// Edit category
const editCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    const { error, value } = categoryValidator_1.categorySchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const { name, icon } = value;
    try {
        const [existingCategory] = yield db_1.default.query('SELECT * FROM categories WHERE id = ?', [id]);
        if (existingCategory.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        yield db_1.default.query('UPDATE categories SET name = ?, icon = ? WHERE id = ?', [name, icon, id]);
        res.json({ message: 'Category updated successfully' });
    }
    catch (error) {
        console.error('Edit category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.editCategory = editCategory;
// Delete category
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    try {
        const [existingCategory] = yield db_1.default.query('SELECT * FROM categories WHERE id = ?', [id]);
        if (existingCategory.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        yield db_1.default.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.deleteCategory = deleteCategory;
// Get all categories
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    try {
        // Corrected: Use RowDataPacket[] for type inference
        const [categories] = yield db_1.default.query('SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL', [userId]);
        res.json(categories);
    }
    catch (error) {
        console.error('Retrieve categories error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.getCategories = getCategories;
