// models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    itemCode: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    drawingCode: { type: String, default: '' },
    revision: { type: String, default: '' },
    minimumOrderQuantity: { type: Number, default: 1, min: 1 }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
