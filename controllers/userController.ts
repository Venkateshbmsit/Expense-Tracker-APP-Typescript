import * as dotenv from 'dotenv';
dotenv.config();


import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import pool from '../utils/db';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validators/userValidator';
import { RowDataPacket } from 'mysql2';



// Define types for the SQL result
interface User extends RowDataPacket {
    id: number;
    username: string;
    email: string;
    password: string;
    profile_picture?: string;
}

interface AuthenticatedRequest extends Request {
    user?: { userId: number; email: string };
}

// Register
export const register = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;

    // Validate input using Joi schema
    const { error } = registerSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]) as unknown as [User[], any];

        if (rows.length > 0) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Server error' });
    }
};


export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validate input using Joi schema
    const { error } = loginSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    try {
        // Fetch user from database
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]) as [User[], any];
        const user = rows[0];

        if (!user || user.password !== password) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        // Ensure JWT_SECRET is defined
        if (!process.env.ACCESS_TOKEN_SECRET) {
            console.error('JWT_SECRET environment variable is not defined');
            res.status(500).json({ error: 'Internal Server Error', details: 'JWT_SECRET environment variable is not defined' });
            return;
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Login error:', error.message);
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        } else {
            console.error('Login error:', 'Unknown error occurred');
            res.status(500).json({ error: 'Internal Server Error', details: 'Unknown error occurred' });
        }
    }
};


// Update Profile
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    const userId = req.user?.userId;
    const { username, email, profilePicture } = req.body;

    if (!userId) {
        return res.status(403).json({ message: 'Unauthorized user' });
    }

    if (!username && !email && !profilePicture) {
        return res.status(400).json({ message: 'At least one field (username, email, or profilePicture) is required' });
    }

    try {
        const updates: string[] = [];
        const values: any[] = [];

        if (username) {
            updates.push('username = ?');
            values.push(username);
        }

        if (email) {
            updates.push('email = ?');
            values.push(email);
        }

        if (profilePicture) {
            updates.push('profile_picture = ?');
            values.push(profilePicture);
        }

        // Ensure there are fields to update
        if (updates.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        // Add userId to the end of the values array
        values.push(userId);

        // Build the SQL query
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

        // Execute the update query
        await pool.query(query, values);

        return res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


// Change Password
export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { oldPassword, newPassword } = req.body;

    // Validate input using Joi schema
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    try {
        // Retrieve the user
        const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]) as unknown as [User[], any];
        const user = rows[0];

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Compare old password with stored password
        if (user.password !== oldPassword) {
            res.status(400).json({ message: 'Old password is incorrect' });
            return;
        }

        // Update the password
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Server error' });
    }
};
