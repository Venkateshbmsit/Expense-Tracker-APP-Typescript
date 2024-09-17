import express from 'express';
const router = express.Router();

const authenticateToken = require('../middlewares/authenticateToken');
const { generateReport } = require('../controllers/reportsController');

// Route for generating reports
router.post('/generate', authenticateToken, generateReport);

export default router;
