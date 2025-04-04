// routes/productRoutes.js
import express from 'express';
import { getProducts, updateProducts, addProduct, deleteProduct } from '../controllers/productController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProducts); // Public route
router.put('/', authenticateToken, isAdmin, updateProducts);
router.post('/', authenticateToken, isAdmin, addProduct);
router.delete('/:id', authenticateToken, isAdmin, deleteProduct);

export default router;
