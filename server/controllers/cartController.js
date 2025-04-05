// cartController.js
import Cart from '../models/cart.js';

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customerEmail: req.params.email });
    res.status(200).json(cart || { customerEmail: req.params.email, items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { customerEmail, items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array." });
    }

    // Validate each item
    for (const item of items) {
      if (!item.itemCode || !item.productName || typeof item.quantity !== 'number') {
        return res.status(400).json({ message: "Invalid item structure." });
      }

      // Enforce minimum order quantity
      const minQuantity = item.minimumOrderQuantity || 1;
      if (item.quantity < minQuantity) {
        return res.status(400).json({ 
          message: `Minimum order quantity for ${item.productName} (${item.itemCode}) is ${minQuantity}.` 
        });
      }
    }

    const cart = await Cart.findOneAndUpdate(
      { customerEmail },
      { items },
      { new: true, upsert: true }
    );
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ customerEmail: req.params.email }, { items: [] });
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};
