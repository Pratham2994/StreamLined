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

        // Delete all existing products and insert the new list
        await Product.deleteMany({});
        const insertedProducts = await Product.insertMany(sanitizedProducts);
        res.status(200).json(insertedProducts);
    } catch (error) {
        console.error("Update products error:", error);
        res.status(500).json({ message: 'Error updating products', error: error.message });
    }
};



export const addProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
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
