
import express, { Request, Response, NextFunction } from 'express';
import { register, login, updateProfile, changePassword } from '../controllers/userController';
import authenticateToken from '../middlewares/authenticateToken';
import multer, { FileFilterCallback } from 'multer';
import path from 'path'; 

const router = express.Router();

// Set up storage for profile picture uploads
const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, 'uploads/');
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to file name
    }
});

// Set up file filtering and limits
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg, and .jpeg format allowed!'));
        }
    }
});

// Define the routes
router.post('/register', register);
router.post('/login', login);
router.put('/profile', authenticateToken, upload.single('profilePicture'), updateProfile);
router.put('/change-password', authenticateToken, changePassword);

export default router;
