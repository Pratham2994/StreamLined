// routes/orderRoutes.js
import express from 'express';
import { getOrders, getCustomerOrders, createOrder, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders); // Admin - Get all orders
router.get('/:email', getCustomerOrders); // Customer - Get orders by email
router.post('/', createOrder); // Noter - Create new order
router.put('/:id', updateOrderStatus); // Admin - Update order status

export default router;
