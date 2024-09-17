"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateToken_1 = __importDefault(require("../middlewares/authenticateToken"));
const expenseValidator_1 = require("../validators/expenseValidator");
const expenseController_1 = require("../controllers/expenseController");
const router = express_1.default.Router();
// Define the routes
router.post('/', authenticateToken_1.default, expenseValidator_1.validateExpense, expenseController_1.addExpense);
router.put('/:id', authenticateToken_1.default, expenseValidator_1.validateExpense, expenseController_1.editExpense);
router.delete('/:id', authenticateToken_1.default, expenseController_1.deleteExpense);
router.get('/', authenticateToken_1.default, expenseController_1.getExpenses);
router.post('/recurring-expense', authenticateToken_1.default, expenseController_1.addRecurringExpense);
exports.default = router;
