// orderController.js
import Order from '../models/orders.js';
import { sendOrderNotificationEmail, sendOrderNotificationWhatsApp, sendOrderStatusNotificationEmail, sendTrackingUpdateNotificationEmail } from '../services/notificationService.js';

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
    let { customerEmail, items, phoneNumber, expectedDeliveryDate, businessName, orderPlacerName } = req.body;

    // Validate required fields
    if (!customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields: customerEmail and items" });
    }

    // Sanitize optional fields: if they are empty or whitespace-only, set to undefined.
    phoneNumber = phoneNumber && phoneNumber.trim() !== "" ? phoneNumber : undefined;
    expectedDeliveryDate = expectedDeliveryDate && expectedDeliveryDate.trim() !== "" ? expectedDeliveryDate : undefined;
    businessName = businessName && businessName.trim() !== "" ? businessName : undefined;
    orderPlacerName = orderPlacerName && orderPlacerName.trim() !== "" ? orderPlacerName : undefined;

    // Validate phone number if provided
    if (phoneNumber && !/^\d{10}$/.test(phoneNumber)) {
      return res.status(400).json({ message: "Invalid phone number. It must be exactly 10 digits." });
    }

    // Validate expected delivery date if provided
    if (expectedDeliveryDate) {
      const date = new Date(expectedDeliveryDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid expected delivery date." });
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      if (date < today) {
        return res.status(400).json({ message: "Expected delivery date cannot be in the past." });
      }
    }

    // Sanitize items: remove _id field from each item
    const sanitizedItems = items.map(item => {
      const { _id, ...rest } = item;
      return rest;
    });

    // Count active orders (those not marked as "Completed")
    const activeOrdersCount = await Order.countDocuments({
      customerEmail: customerEmail.toLowerCase(), // ensure consistency
      orderStatus: { $ne: "Completed" }
    });
    if (activeOrdersCount >= 3) {
      return res.status(400).json({
        message: "You have reached the maximum of 3 active orders. Please wait until one order is marked as complete before placing a new order."
      });
    }

    // Build order data using sanitized values
    const newOrderData = { customerEmail: customerEmail.toLowerCase(), items: sanitizedItems };
    if (phoneNumber) newOrderData.phoneNumber = phoneNumber;
    if (expectedDeliveryDate) newOrderData.expectedDeliveryDate = expectedDeliveryDate;
    if (businessName) newOrderData.businessName = businessName;
    if (orderPlacerName) newOrderData.orderPlacerName = orderPlacerName;

    const newOrder = new Order(newOrderData);
    await newOrder.save();

    // Send notifications asynchronously (if applicable)
    sendOrderNotificationEmail(newOrder)
      .then(() => console.log("Order email notification sent."))
      .catch(err => console.error("Error sending order email notification:", err));
    sendOrderNotificationWhatsApp(newOrder)
      .then(() => console.log("Order WhatsApp notification sent."))
      .catch(err => console.error("Error sending order WhatsApp notification:", err));

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { orderStatus } = req.body;
    
    // Validate the new status
    if (!orderStatus || !['Accepted', 'Rejected', 'In Progress', 'Completed'].includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status provided." });
    }

    // Get the current order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the status transition is valid
    if (!order.canTransitionTo(orderStatus)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${order.orderStatus} to ${orderStatus}` 
      });
    }

    // Update the order status
    order.orderStatus = orderStatus;

    // If accepting the order, initialize tracking stages if not already present
    if (orderStatus === 'Accepted' && (!order.tracking || order.tracking.length <= 1)) {
      order.tracking = [
        { stage: 'Order Placed', plannedDate: order.createdAt, actualDate: order.createdAt },
        { stage: 'Fabrication', plannedDate: null, actualDate: null },
        { stage: 'Sheet Metal Processing', plannedDate: null, actualDate: null },
        { stage: 'Quality Check', plannedDate: null, actualDate: null },
        { stage: 'Dispatch', plannedDate: null, actualDate: null },
        { stage: 'Delivered', plannedDate: null, actualDate: null }
      ];
    }

    await order.save();

    // Send notifications
    if (orderStatus === 'Accepted' || orderStatus === 'Rejected') {
      try {
        await sendOrderStatusNotificationEmail(order);
        console.log("Order status email notification sent.");
      } catch (err) {
        console.error("Error sending order status email notification:", err);
      }
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error: error.message });
  }
};

export const updateTrackingProgress = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { tracking } = req.body;

    if (!Array.isArray(tracking)) {
      return res.status(400).json({ message: "Tracking must be an array." });
    }

    // Get the current order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only allow tracking updates for Accepted orders
    if (order.orderStatus !== 'Accepted' && order.orderStatus !== 'In Progress') {
      return res.status(400).json({ 
        message: "Can only update tracking for Accepted or In Progress orders" 
      });
    }

    // Validate tracking data
    const isValidTracking = tracking.every(stage => {
      return stage.stage && 
        (!stage.plannedDate || new Date(stage.plannedDate).toString() !== 'Invalid Date') &&
        (!stage.actualDate || new Date(stage.actualDate).toString() !== 'Invalid Date');
    });

    if (!isValidTracking) {
      return res.status(400).json({ message: "Invalid tracking data provided" });
    }

    // Update tracking
    order.tracking = tracking;

    // Check if all stages have actual dates (except Delivered)
    const allStagesCompleted = tracking.slice(0, -1).every(stage => stage.actualDate);
    const deliveryStage = tracking[tracking.length - 1];
    
    // Update order status based on tracking progress
    if (deliveryStage.actualDate) {
      order.orderStatus = 'Completed';
    } else if (allStagesCompleted) {
      order.orderStatus = 'In Progress';
    }

    await order.save();

    // Always send tracking update email when tracking is updated
    try {
      await sendTrackingUpdateNotificationEmail(order);
      console.log("Tracking update email sent successfully.");
    } catch (err) {
      console.error("Error sending tracking update email:", err);
      // Don't throw the error, just log it
    }

    res.status(200).json(order);
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
