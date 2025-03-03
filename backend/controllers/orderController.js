import Order from '../models/orders.js';

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all orders", error: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    // Extract new fields along with customerEmail and items
    const { customerEmail, items, phoneNumber, expectedDeliveryDate } = req.body;
    if (!customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields: customerEmail and items" });
    }
    
    // Count active orders (orders not marked as complete)
    const activeOrdersCount = await Order.countDocuments({
      customerEmail,
      orderStatus: { $ne: "Completed" }
    });
    
    // Allow a maximum of 3 active orders per email
    if (activeOrdersCount >= 3) {
      return res.status(400).json({
        message: "You have reached the maximum of 3 active orders. Please wait until one order is marked as complete before placing a new order."
      });
    }

    // Create the order including optional fields if provided
    const newOrder = new Order({ customerEmail, items, phoneNumber, expectedDeliveryDate });
    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerEmail: req.params.email });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer orders", error: error.message });
  }
};
