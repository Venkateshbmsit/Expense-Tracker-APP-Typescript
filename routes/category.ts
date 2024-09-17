import express from 'express';
import { addCategory, editCategory, deleteCategory, getCategories } from '../controllers/categoryController';
import authenticateToken from '../middlewares/authenticateToken';

const router = express.Router();

// Add new category
router.post('/', authenticateToken, addCategory);

// Edit category
router.put('/:id', authenticateToken, editCategory);

// Delete category
router.delete('/:id', authenticateToken, deleteCategory);

// Retrieve categories
router.get('/', authenticateToken, getCategories);

export default router;
