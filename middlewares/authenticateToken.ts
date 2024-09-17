import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Define an interface to extend the Request object with user info
interface AuthenticatedRequest extends Request {
    user?: { userId: number; email: string };
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from header

    if (!token) {
        console.error("No token provided");
        return res.status(401).json({ message: 'Token not provided' }); // No token provided
    }

    // Verify token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decodedToken: JwtPayload | string | undefined) => {
        if (err) {
            console.error("Token verification error:", err);
            return res.status(403).json({ message: 'Invalid token' }); // Invalid token
        }

        // Check if decoded token is an object and contains userId
        if (decodedToken && typeof decodedToken === 'object' && 'userId' in decodedToken) {
            req.user = { userId: (decodedToken as JwtPayload).userId, email: (decodedToken as JwtPayload).email };
            console.log("User authenticated:", req.user); // Log user info
            next(); // Proceed to next middleware or route handler
        } else {
            console.error("Decoded token does not have userId or email");
            return res.status(403).json({ message: 'Invalid token payload' }); // Token does not contain user info
        }
    });
};

export default authenticateToken;
