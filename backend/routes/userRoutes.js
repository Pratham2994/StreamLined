// userRoutes.js
import express from 'express';
import { signup, login } from '../controllers/userController.js'; // Adjust path as necessary

const router = express.Router();

// User routes
router.post('/signup', signup);
router.post('/login', login);

export default router;
