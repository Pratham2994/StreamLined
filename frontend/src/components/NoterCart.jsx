import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from './ParticlesBackground';

const NoterCart = () => {
  const navigate = useNavigate();
  const [customerEmail, setCustomerEmail] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [emptyCartSnackbarOpen, setEmptyCartSnackbarOpen] = useState(false);
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);
  useEffect(() => {
    const email = localStorage.getItem('noterCustomerEmail');
    if (email) {
      setCustomerEmail(email);
      fetchCart(email);
    }
  }, []);

  const fetchCart = async (email) => {
    try {
      const res = await fetch(`http://localhost:3000/api/cart/${email}`, { credentials: 'include' });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const updateCart = async (updatedItems) => {
    try {
      const res = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customerEmail, items: updatedItems })
      });
      if (res.ok) {
        setCartItems(updatedItems);
      } else {
        alert('Failed to update cart.');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleQuantityChange = (itemCode, value) => {
    const updated = cartItems.map(item =>
      item.itemCode === itemCode ? { ...item, quantity: parseInt(value) } : item
    );
    updateCart(updated);
  };

  const handleRemove = (itemCode) => {
    const updated = cartItems.filter(item => item.itemCode !== itemCode);
    updateCart(updated);
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      setEmptyCartSnackbarOpen(true);
    } else {
      setConfirmOpen(true);
    }
  };

  const confirmOrder = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customerEmail, items: cartItems })
      });
      if (response.ok) {
        alert("Order placed successfully!");
        await fetch(`http://localhost:3000/api/cart/${customerEmail}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        setCartItems([]);
        navigate('/noter');
      } else {
        alert("Error placing order.");
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order.");
    }
    setConfirmOpen(false);
  };

  const handleEmptyCartSnackbarClose = () => {
    setEmptyCartSnackbarOpen(false);
  };

  return (
    <Box sx={{ position: 'relative', p: 3, minHeight: '100vh', backgroundColor: 'transparent' }}>

      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <ParticlesBackground />
      </Box>
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>Noter Cart</Typography>
      {cartItems.length === 0 ? (
        <Typography sx={{ textAlign: 'center', color: '#888' }}>Your cart is empty.</Typography>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{
            backgroundColor: 'rgba(240,248,255,0.85)',
            borderRadius: '8px',
            overflowX: 'auto'
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
                <TableCell>Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartItems.map(item => (
                <TableRow key={item.itemCode}>
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.drawingCode}</TableCell>
                  <TableCell>{item.revision}</TableCell>
                  <TableCell>
                    <TextField 
                      type="number"
                      size="small"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.itemCode, e.target.value)}
                      inputProps={{ min: 1 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" color="error" sx={{ textTransform: 'none' }} onClick={() => handleRemove(item.itemCode)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="contained" onClick={handlePlaceOrder} sx={{ textTransform: 'none', padding: '8px 24px' }}>
          Place Order
        </Button>
      </Box>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 2, maxWidth: 400, width: '90%' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleOutlineIcon color="primary" fontSize="large" />
          Confirm Your Order
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to place this order? Please review your items and quantities before confirming.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmOrder} variant="contained">Confirm Order</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={emptyCartSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleEmptyCartSnackbarClose}
      >
        <Alert severity="warning" onClose={handleEmptyCartSnackbarClose}>
          Your cart is empty.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NoterCart;
