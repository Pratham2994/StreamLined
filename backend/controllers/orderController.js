// controllers/orderController.js
import Order from '../models/orders.js';

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.params.email });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer orders', error: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { customerEmail, status } = req.body;
    const order = new Order({ customerEmail, status });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};