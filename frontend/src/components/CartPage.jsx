import React, { useState, useEffect, useContext } from 'react';
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
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [emptyCartSnackbarOpen, setEmptyCartSnackbarOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [orderPlacerName, setOrderPlacerName] = useState('');

  const isValidPhoneNumber = (phone) => /^\d{10}$/.test(phone);
  const isValidDeliveryDate = (dateStr) => {
    const selectedDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/cart/${user.email}`, { credentials: 'include' });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    if (user && user.email) {
      fetchCart();
    }
  }, [user]);

  const updateCart = async (updatedItems) => {
    try {
      const res = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customerEmail: user.email, items: updatedItems })
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
    if (!phoneNumber || !deliveryDate || !businessName || !orderPlacerName) {
      alert('Please provide your phone number, expected delivery date, business name, and order placer name.');
      return;
    }
    if (!isValidPhoneNumber(phoneNumber)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }
    if (!isValidDeliveryDate(deliveryDate)) {
      alert('Expected delivery date cannot be in the past.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          customerEmail: user.email, 
          items: cartItems,
          phoneNumber,
          expectedDeliveryDate: deliveryDate,
          businessName,
          orderPlacerName
        })
      });
      if (response.ok) {
        alert("Order placed successfully!");
        await fetch(`http://localhost:3000/api/cart/${user.email}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        setCartItems([]);
        navigate('/customer/orders');
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
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>My Cart</Typography>
      {cartItems.length === 0 ? (
        <Typography sx={{ textAlign: 'center', color: '#888' }}>Your cart is empty.</Typography>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{
            width: '100%',
            backgroundColor: 'rgba(240,248,255,0.85)',
            borderRadius: '8px',
            overflowX: 'auto'
          }}
        >
          <Table sx={{ minWidth: 600 }}>
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
          Confirm Order
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please review your order details. Provide your business name, order placer name, phone number, and expected delivery date before confirming.
          </Typography>
          <TextField
            label="Business Name"
            fullWidth
            margin="dense"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            helperText="Enter your business name"
          />
          <TextField
            label="Order Placer Name"
            fullWidth
            margin="dense"
            value={orderPlacerName}
            onChange={(e) => setOrderPlacerName(e.target.value)}
            helperText="Enter the name of the person placing the order"
          />
          <TextField
            label="Phone Number"
            fullWidth
            margin="dense"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            helperText="Enter exactly 10 digits"
          />
          <TextField
            label="Expected Delivery Date"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            helperText="Select a date from today onward"
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmOrder} variant="contained">Confirm Order</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={emptyCartSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setEmptyCartSnackbarOpen(false)}
      >
        <Alert severity="warning" onClose={() => setEmptyCartSnackbarOpen(false)}>
          Your cart is empty.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CartPage;
