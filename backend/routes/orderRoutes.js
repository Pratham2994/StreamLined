import express from 'express';
import { getCustomerOrders, createOrder, getAllOrders } from '../controllers/orderController.js';

const router = express.Router();

router.get('/all', getAllOrders); // For admin to get all orders
router.get('/:email', getCustomerOrders); // For customers
router.post('/', createOrder); // Create new order

export default router;
