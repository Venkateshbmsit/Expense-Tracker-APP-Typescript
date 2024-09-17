"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from header
    if (!token) {
        console.error("No token provided");
        return res.status(401).json({ message: 'Token not provided' }); // No token provided
    }
    // Verify token
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
        if (err) {
            console.error("Token verification error:", err);
            return res.status(403).json({ message: 'Invalid token' }); // Invalid token
        }
        // Check if decoded token is an object and contains userId
        if (decodedToken && typeof decodedToken === 'object' && 'userId' in decodedToken) {
            req.user = { userId: decodedToken.userId, email: decodedToken.email };
            console.log("User authenticated:", req.user); // Log user info
            next(); // Proceed to next middleware or route handler
        }
        else {
            console.error("Decoded token does not have userId or email");
            return res.status(403).json({ message: 'Invalid token payload' }); // Token does not contain user info
        }
    });
};
exports.default = authenticateToken;
