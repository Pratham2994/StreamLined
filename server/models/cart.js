// models/Cart.js
import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  itemCode: { type: String, required: true },
  productName: { type: String, required: true },
  drawingCode: { type: String },
  revision: { type: String },
  quantity: { type: Number, required: true },
  minimumOrderQuantity: { type: Number, required: true, default: 1 }
});

const cartSchema = new mongoose.Schema({
  customerEmail: { type: String, required: true, unique: true },
  items: [cartItemSchema]
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
