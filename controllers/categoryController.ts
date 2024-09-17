import { Request, Response } from 'express';
import pool from '../utils/db';
import { categorySchema } from '../validators/categoryValidator';
import { RowDataPacket } from 'mysql2';

// Add new category
export const addCategory = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const { error, value } = categorySchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, icon } = value;

    try {
        const [result] = await pool.query('INSERT INTO categories (name, icon, user_id) VALUES (?, ?, ?)', [name, icon, userId]);
        res.status(201).json({ message: 'Category added successfully', categoryId: (result as any).insertId });
    } catch (error) {
        console.error('Add category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Edit category
export const editCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const { error, value } = categorySchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, icon } = value;

    try {
        const [existingCategory] = await pool.query<RowDataPacket[]>('SELECT * FROM categories WHERE id = ?', [id]);

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await pool.query('UPDATE categories SET name = ?, icon = ? WHERE id = ?', [name, icon, id]);
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Edit category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete category
export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        const [existingCategory] = await pool.query<RowDataPacket[]>('SELECT * FROM categories WHERE id = ?', [id]);

        if (existingCategory.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        // Corrected: Use RowDataPacket[] for type inference
        const [categories] = await pool.query<RowDataPacket[]>('SELECT * FROM categories WHERE user_id = ? OR user_id IS NULL', [userId]);
        res.json(categories);
    } catch (error) {
        console.error('Retrieve categories error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
