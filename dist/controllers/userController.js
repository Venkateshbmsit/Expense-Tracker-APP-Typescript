"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.changePassword = exports.updateProfile = exports.login = exports.register = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../utils/db"));
const userValidator_1 = require("../validators/userValidator");
// Register
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    // Validate input using Joi schema
    const { error } = userValidator_1.registerSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }
    try {
        const [rows] = yield db_1.default.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        yield db_1.default.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
        res.status(201).json({ message: 'User registered successfully' });
    }
    catch (error) {
        console.error('Registration error:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    // Validate input using Joi schema
    const { error } = userValidator_1.loginSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }
    try {
        // Fetch user from database
        const [rows] = yield db_1.default.query('SELECT * FROM users WHERE email = ?', [email]);
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
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Login error:', error.message);
            res.status(500).json({ error: 'Internal Server Error', details: error.message });
        }
        else {
            console.error('Login error:', 'Unknown error occurred');
            res.status(500).json({ error: 'Internal Server Error', details: 'Unknown error occurred' });
        }
    }
});
exports.login = login;
// Update Profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { username, email, profilePicture } = req.body;
    if (!userId) {
        return res.status(403).json({ message: 'Unauthorized user' });
    }
    if (!username && !email && !profilePicture) {
        return res.status(400).json({ message: 'At least one field (username, email, or profilePicture) is required' });
    }
    try {
        const updates = [];
        const values = [];
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
        yield db_1.default.query(query, values);
        return res.status(200).json({ message: 'Profile updated successfully' });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});
exports.updateProfile = updateProfile;
// Change Password
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { oldPassword, newPassword } = req.body;
    // Validate input using Joi schema
    const { error } = userValidator_1.changePasswordSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }
    try {
        // Retrieve the user
        const [rows] = yield db_1.default.query('SELECT password FROM users WHERE id = ?', [userId]);
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
        yield db_1.default.query('UPDATE users SET password = ? WHERE id = ?', [newPassword, userId]);
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Change password error:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.changePassword = changePassword;
