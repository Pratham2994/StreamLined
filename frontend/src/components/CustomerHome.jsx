import React, { useState, useContext, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';

const CustomerHome = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  // New state for products fetched from backend
  const [products, setProducts] = useState([]);

  // Fetch products from backend when component mounts
  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  // Filter products based on search term
  const filteredProducts = searchTerm
    ? products.filter(product =>
        product.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.drawingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.revision.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  // Remove duplicates based on itemCode if needed
  const uniqueFilteredProducts = (() => {
    const map = new Map();
    filteredProducts.forEach(product => {
      if (!map.has(product.itemCode)) {
        map.set(product.itemCode, product);
      }
    });
    return Array.from(map.values());
  })();

  const handleAddToCart = async (product) => {
    // Parse quantity and default to 1 if missing or invalid
    const quantity = parseInt(quantities[product.itemCode]) || 1;
    try {
      const res = await fetch(`http://localhost:3000/api/cart/${user.email}`, { credentials: 'include' });
      let cartData = await res.json();
      if (!cartData.items) {
        cartData.items = [];
      }
      const index = cartData.items.findIndex(item => item.itemCode === product.itemCode);
      if (index !== -1) {
        cartData.items[index].quantity += quantity;
      } else {
        cartData.items.push({ ...product, quantity });
      }
      const updateRes = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customerEmail: user.email, items: cartData.items })
      });
      if (updateRes.ok) {
        alert(`${product.productName} added to cart.`);
      } else {
        alert('Failed to update cart.');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Error updating cart.');
    }
  };

  return (
    <Box sx={{ position: 'relative', p: 3, minHeight: '100vh', backgroundColor: 'transparent' }}>
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <ParticlesBackground />
      </Box>
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>Products</Typography>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <TextField
          label="Search products"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '300px' }}
        />
      </Box>
      <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(240,248,255,0.85)', borderRadius: '8px', overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Code</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Drawing Code</TableCell>
              <TableCell>Revision</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Add to Cart</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uniqueFilteredProducts.map(product => (
              <TableRow key={product.itemCode}>
                <TableCell>{product.itemCode}</TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.drawingCode}</TableCell>
                <TableCell>{product.revision}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    value={quantities[product.itemCode] === undefined ? 1 : quantities[product.itemCode]}
                    onChange={(e) => setQuantities(prev => ({ ...prev, [product.itemCode]: e.target.value }))}
                    inputProps={{ min: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="contained" sx={{ textTransform: 'none' }} onClick={() => handleAddToCart(product)}>
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CustomerHome;
