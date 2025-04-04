import express from 'express';
import { getCustomerOrders, createOrder, getAllOrders, updateOrderStatus, updateTrackingProgress, deleteOrder } from '../controllers/orderController.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', authenticateToken, isAdmin, getAllOrders); // For admin
router.get('/:email', authenticateToken, getCustomerOrders); // For customers
router.post('/', authenticateToken, createOrder); // Create new order
router.put('/:orderId/status', authenticateToken, isAdmin, updateOrderStatus); // Update order status
router.put('/:orderId/tracking', authenticateToken, isAdmin, updateTrackingProgress); // Update tracking progress
router.delete('/:orderId', authenticateToken, isAdmin, deleteOrder); // Delete order

export default router;
