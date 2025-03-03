import React, { useState, useContext } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';

const products = [
  { itemCode: '56101997DG00795', productName: 'Slimline H1 Assy PC', drawingCode: '56101997DG00795', revision: 'Rev1' },
  { itemCode: '56101905DG14847', productName: 'KREATION X2 OHU MAIN BODY 400W', drawingCode: '56101905DG14847', revision: 'Rev1' },
  { itemCode: '56101905DG15222', productName: 'KREATION X2 OHU ADDON BODY 400W', drawingCode: '56101905DG15222', revision: 'Rev1' },
  { itemCode: '56101905DG14840', productName: 'KREATION X2 OHU MAIN BODY 500W', drawingCode: '56101905DG14840', revision: 'Rev1' },
  { itemCode: '56101905DG14845', productName: 'KREATION X2 OHU ADDON BODY 800W', drawingCode: '56101905DG14845', revision: 'Rev1' },
  { itemCode: '56101905DG14839', productName: 'KREATION X2 OHU ADDON BODY 900W', drawingCode: '56101905DG14839', revision: 'Rev1' },
  // ... (rest of the products)
];

const NoterHome = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [quantities, setQuantities] = useState({});

  // Email validation
  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleCustomerEmailChange = (e) => {
    const email = e.target.value;
    setCustomerEmail(email);
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
    } else {
      setEmailError('');
      // Store the valid email for use in NoterCart
      localStorage.setItem('noterCustomerEmail', email);
    }
  };

  const handleQuantityChange = (itemCode, value) => {
    setQuantities(prev => ({ ...prev, [itemCode]: value }));
  };

  const handleAddToCart = async (product) => {
    if (!customerEmail || emailError) {
      alert("Please enter a valid customer email before adding items to cart.");
      return;
    }
    const quantity = parseInt(quantities[product.itemCode]) || 1;
    try {
      // Fetch current cart for the provided customer email
      const res = await fetch(`http://localhost:3000/api/cart/${customerEmail}`, { credentials: 'include' });
      let cartData = await res.json();
      if (!cartData.items) {
        cartData.items = [];
      }
      // If product exists, increment quantity; else add product
      const index = cartData.items.findIndex(item => item.itemCode === product.itemCode);
      if (index !== -1) {
        cartData.items[index].quantity += quantity;
      } else {
        cartData.items.push({ ...product, quantity });
      }
      // Update the cart in the backend
      const updateRes = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customerEmail, items: cartData.items })
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
    <Box sx={{ position: 'relative', p: 3, minHeight: '100vh' }}>
      {/* Particle Background */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <ParticlesBackground />
      </Box>

      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
        Place Order as Noter
      </Typography>

      {/* Customer Email Field with validation */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <TextField 
          label="Customer Email"
          type="email"
          value={customerEmail}
          onChange={handleCustomerEmailChange}
          sx={{ width: '300px' }}
          error={Boolean(emailError)}
          helperText={emailError}
        />
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          backgroundColor: 'rgba(240,248,255,0.85)', // 85% opacity with a slight blue tint
          borderRadius: '8px'
        }}
      >
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
            {products.map(product => (
              <TableRow key={product.itemCode}>
                <TableCell>{product.itemCode}</TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.drawingCode}</TableCell>
                <TableCell>{product.revision}</TableCell>
                <TableCell>
                  <TextField 
                    type="number"
                    size="small"
                    value={quantities[product.itemCode] || 1}
                    onChange={(e) => handleQuantityChange(product.itemCode, e.target.value)}
                    inputProps={{ min: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="contained" sx={{ textTransform: 'none' }} onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button 
          variant="outlined" 
          onClick={() => {
            if (!customerEmail || emailError) {
              alert("Please enter a valid customer email before proceeding to cart.");
            } else {
              navigate('/noter/cart');
            }
          }} 
          sx={{ textTransform: 'none' }}
        >
          Go to Cart
        </Button>
      </Box>
    </Box>
  );
};

export default NoterHome;
