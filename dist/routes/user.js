"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authenticateToken_1 = __importDefault(require("../middlewares/authenticateToken"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Set up storage for profile picture uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname)); // Add timestamp to file name
    }
});
// Set up file filtering and limits
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        }
        else {
            cb(new Error('Only .png, .jpg, and .jpeg format allowed!'));
        }
    }
});
// Define the routes
router.post('/register', userController_1.register);
router.post('/login', userController_1.login);
router.put('/profile', authenticateToken_1.default, upload.single('profilePicture'), userController_1.updateProfile);
router.put('/change-password', authenticateToken_1.default, userController_1.changePassword);
exports.default = router;
