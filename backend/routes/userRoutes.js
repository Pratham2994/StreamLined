// src/routes/userRoutes.js
import express from 'express';
import { signup, login, profile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', authenticateToken, profile);

export default router;
