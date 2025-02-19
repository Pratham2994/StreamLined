// models/orders.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ['Fabrication', 'Cutting', 'Welding', 'Assembly', 'Completed'],
    default: 'Fabrication',
  },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;