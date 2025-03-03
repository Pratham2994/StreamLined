// routes/cartRoutes.js
import express from 'express';
import { getCart, updateCart, clearCart } from '../controllers/cartController.js';

const router = express.Router();

router.get('/:email', getCart);
router.post('/', updateCart);
router.delete('/:email', clearCart);

export default router;
