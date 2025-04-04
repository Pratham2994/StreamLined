// routes/cartRoutes.js
import express from 'express';
import { getCart, updateCart, clearCart } from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:email', authenticateToken, getCart);
router.post('/', authenticateToken, updateCart);
router.delete('/:email', authenticateToken, clearCart);

export default router;
