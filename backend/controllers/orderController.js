// orderController.js
import Order from '../models/orders.js';
import { sendOrderNotificationEmail, sendOrderNotificationWhatsApp, sendOrderStatusNotificationEmail } from '../services/notificationService.js';

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
    const { customerEmail, items, phoneNumber, expectedDeliveryDate, businessName, orderPlacerName } = req.body;
    if (!customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields: customerEmail and items" });
    }
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number. It must be exactly 10 digits." });
    }
    if (expectedDeliveryDate) {
      const date = new Date(expectedDeliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      if (date < today) {
        return res.status(400).json({ message: "Expected delivery date cannot be in the past." });
      }
    }
    const activeOrdersCount = await Order.countDocuments({
      customerEmail,
      orderStatus: { $ne: "Completed" }
    });
    if (activeOrdersCount >= 3) {
      return res.status(400).json({
        message: "You have reached the maximum of 3 active orders. Please wait until one order is marked as complete before placing a new order."
      });
    }
    const newOrder = new Order({ customerEmail, items, phoneNumber, expectedDeliveryDate, businessName, orderPlacerName });
    await newOrder.save();

    // Fire off notifications for new order
    sendOrderNotificationEmail(newOrder)
      .then(() => console.log("Order email notification sent."))
      .catch(err => console.error("Error sending order email notification:", err));
      
    sendOrderNotificationWhatsApp(newOrder)
      .then(() => console.log("Order WhatsApp notification sent."))
      .catch(err => console.error("Error sending order WhatsApp notification:", err));

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { orderStatus } = req.body;
    if (!orderStatus || !['Accepted', 'Rejected', 'Pending', 'Completed'].includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status provided." });
    }
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus }, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    // If status is Accepted or Rejected, send notification to customer
    if (orderStatus === 'Accepted' || orderStatus === 'Rejected') {
      sendOrderStatusNotificationEmail(updatedOrder)
        .then(() => console.log("Order status email notification sent."))
        .catch(err => console.error("Error sending order status email notification:", err));
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error: error.message });
  }
};

export const updateTrackingProgress = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { tracking } = req.body; // tracking should be an array of { stage, plannedDate, actualDate }
    if (!Array.isArray(tracking)) {
      return res.status(400).json({ message: "Tracking must be an array." });
    }
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { tracking }, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Error updating tracking progress", error: error.message });
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

export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully", order: deletedOrder });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
};
