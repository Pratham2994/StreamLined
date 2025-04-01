import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/authmiddleware.js';

const router = express.Router();

// This file is preserved for potential future configuration endpoints
// All page content is now hardcoded in the frontend

export default router; 