import express from 'express';
import { getCustomerOrders, createOrder, getAllOrders, updateOrderStatus, updateTrackingProgress, deleteOrder } from '../controllers/orderController.js';

const router = express.Router();

router.get('/all', getAllOrders); // For admin
router.get('/:email', getCustomerOrders); // For customers
router.post('/', createOrder); // Create new order
router.put('/:orderId/status', updateOrderStatus); // Update order status
router.put('/:orderId/tracking', updateTrackingProgress); // Update tracking progress
router.delete('/:orderId', deleteOrder); // Delete order

export default router;
