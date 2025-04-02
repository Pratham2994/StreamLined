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
  plannedDate: { type: Date },
  actualDate: { type: Date }
});

const orderSchema = new mongoose.Schema(
  {
    customerEmail: { type: String, required: true },
    businessName: { type: String, required: false },
    orderPlacerName: { type: String, required: false },
    items: [orderItemSchema],
    orderStatus: { 
      type: String, 
      enum: ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed'],
      default: "Pending"
    },
    phoneNumber: { type: String, required: false },
    expectedDeliveryDate: { type: Date, required: false },
    tracking: { type: [trackingStageSchema], default: [] }
  },
  { timestamps: true }
);

// Pre-save middleware to handle status transitions
orderSchema.pre('save', function(next) {
  // If this is a new order, initialize tracking with Order Placed
  if (this.isNew) {
    this.tracking = [{
      stage: 'Order Placed',
      plannedDate: new Date(),
      actualDate: new Date()
    }];
  }
  next();
});

// Method to validate status transition
orderSchema.methods.canTransitionTo = function(newStatus) {
  const currentStatus = this.orderStatus;
  
  // Define valid transitions
  const validTransitions = {
    'Pending': ['Accepted', 'Rejected'],
    'Accepted': ['In Progress', 'Rejected'],
    'In Progress': ['Completed'],
    'Completed': [],
    'Rejected': []
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

const Order = mongoose.model("Order", orderSchema);
export default Order;
