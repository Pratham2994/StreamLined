// routes/productRoutes.js
import express from 'express';
import { getProducts, updateProducts, addProduct, deleteProduct } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.put('/', updateProducts);
router.post('/', addProduct);
router.delete('/:id', deleteProduct);

export default router;
