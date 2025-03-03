import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  itemCode: { type: String, required: true },
  productName: { type: String, required: true },
  drawingCode: { type: String },
  revision: { type: String },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema(
  {
    customerEmail: { type: String, required: true },
    items: [orderItemSchema],
    orderStatus: { type: String, default: "Pending" },
    phoneNumber: { type: String, required: false }, // optional field
    expectedDeliveryDate: { type: Date, required: false } // optional field
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
