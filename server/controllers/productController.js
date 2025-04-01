// controllers/productController.js
import Product from '../models/product.js';
import mongoose from 'mongoose';

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
    if (products.length === 0) {
      return res.status(400).json({ message: 'Products array cannot be empty.' });
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

    // Get all existing products
    const existingProducts = await Product.find({});
    const existingItemCodes = new Set(existingProducts.map(p => p.itemCode));
    
    // Separate products into updates and new additions
    const updates = [];
    const additions = [];
    sanitizedProducts.forEach(prod => {
      if (existingItemCodes.has(prod.itemCode)) {
        updates.push(prod);
      } else {
        additions.push(prod);
      }
    });

    // Calculate which products should be removed
    const newItemCodes = new Set(sanitizedProducts.map(p => p.itemCode));
    const itemCodesToRemove = [...existingItemCodes].filter(code => !newItemCodes.has(code));

    // Perform all operations within a transaction
    const session = await mongoose.startSession();
    let updatedProducts = [];
    
    try {
      await session.withTransaction(async () => {
        // Remove products that are no longer in the list
        if (itemCodesToRemove.length > 0) {
          await Product.deleteMany({ itemCode: { $in: itemCodesToRemove } }, { session });
        }

        // Update existing products
        for (const prod of updates) {
          await Product.findOneAndUpdate(
            { itemCode: prod.itemCode },
            prod,
            { new: true, session }
          );
        }

        // Add new products
        if (additions.length > 0) {
          await Product.insertMany(additions, { session });
        }

        // Fetch final result
        updatedProducts = await Product.find({}, null, { session });
      });

      await session.endSession();
      res.status(200).json(updatedProducts);
    } catch (error) {
      await session.endSession();
      throw error;
    }
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
