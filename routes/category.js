"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const authenticateToken_1 = __importDefault(require("../middlewares/authenticateToken"));
const router = express_1.default.Router();
// Add new category
router.post('/', authenticateToken_1.default, categoryController_1.addCategory);
// Edit category
router.put('/:id', authenticateToken_1.default, categoryController_1.editCategory);
// Delete category
router.delete('/:id', authenticateToken_1.default, categoryController_1.deleteCategory);
// Retrieve categories
router.get('/', authenticateToken_1.default, categoryController_1.getCategories);
exports.default = router;
