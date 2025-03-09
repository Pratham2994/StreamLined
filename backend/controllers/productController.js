// controllers/productController.js
import Product from '../models/product.js';

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

export const updateProducts = async (req, res) => {
  try {
    const products = req.body.products;
    if (!Array.isArray(products)) {
      return res.status(400).json({ message: 'Products must be an array.' });
    }
    // Sanitize each product to keep only the allowed fields
    const sanitizedProducts = products.map(prod => ({
      itemCode: prod.itemCode,
      productName: prod.productName,
      drawingCode: prod.drawingCode || '',
      revision: prod.revision || ''
    }));

    // Check for duplicate item codes within the uploaded products
    const seenItemCodes = new Set();
    for (let prod of sanitizedProducts) {
      if (seenItemCodes.has(prod.itemCode)) {
        return res.status(400).json({ message: `Duplicate item code detected: ${prod.itemCode}` });
      }
      seenItemCodes.add(prod.itemCode);
    }

    // Delete all existing products and insert the new list
    await Product.deleteMany({});
    const insertedProducts = await Product.insertMany(sanitizedProducts);
    res.status(200).json(insertedProducts);
  } catch (error) {
    console.error("Update products error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: `Duplicate key error: ${JSON.stringify(error.keyValue)}` });
    }
    res.status(500).json({ message: 'Error updating products', error: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { itemCode, productName, drawingCode, revision } = req.body;
    // Check for an existing product with the same item code, product name, or drawing code
    const existing = await Product.findOne({
      $or: [
        { itemCode },
        { productName },
        { drawingCode }
      ]
    });
    if (existing) {
      return res.status(400).json({ message: 'Duplicate product found: a product with the same item code, product name, or drawing code already exists.' });
    }
    const newProduct = new Product({ itemCode, productName, drawingCode: drawingCode || '', revision: revision || '' });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: `Duplicate key error: ${JSON.stringify(error.keyValue)}` });
    }
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json({ message: 'Product deleted', product: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};
