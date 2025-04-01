// orders.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  itemCode: { type: String, required: true },
  productName: { type: String, required: true },
  drawingCode: { type: String },
  revision: { type: String },
  quantity: { type: Number, required: true }
});

const trackingStageSchema = new mongoose.Schema({
  stage: { type: String, required: true },
  plannedDate: { type: Date, required: true },
  actualDate: { type: Date }
});

const orderSchema = new mongoose.Schema(
  {
    customerEmail: { type: String, required: true },
    businessName: { type: String, required: false },
    orderPlacerName: { type: String, required: false },
    items: [orderItemSchema],
    orderStatus: { type: String, default: "Pending" },
    phoneNumber: { type: String, required: false },
    expectedDeliveryDate: { type: Date, required: false },
    tracking: { type: [trackingStageSchema], default: [] }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
