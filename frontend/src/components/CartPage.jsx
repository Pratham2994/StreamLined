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
  CircularProgress,
  Backdrop
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastContainerKey, setToastContainerKey] = useState(0);
  const [details, setDetails] = useState({
    phoneNumber: '',
    expectedDeliveryDate: '',
    businessName: '',
    orderPlacerName: ''
  });
  const [errors, setErrors] = useState({
    phoneNumber: '',
    expectedDeliveryDate: '',
    businessName: '',
    orderPlacerName: ''
  });

  // Force a re-render of ToastContainer
  useEffect(() => {
    setToastContainerKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (user && user.email) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/cart/${user.email}`, { 
        credentials: 'include' 
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch cart');
      }
      
      const data = await response.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error(`Failed to load cart: ${error.message || 'Server not responding'}`, {
        position: "bottom-right",
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateDetails = () => {
    let valid = true;
    const newErrors = {
      phoneNumber: '',
      expectedDeliveryDate: '',
      businessName: '',
      orderPlacerName: ''
    };

    if (!details.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
      valid = false;
    }
    if (!details.orderPlacerName.trim()) {
      newErrors.orderPlacerName = 'Order placer name is required';
      valid = false;
    }
    if (!/^\d{10}$/.test(details.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
      valid = false;
    }
    if (!details.expectedDeliveryDate.trim()) {
      newErrors.expectedDeliveryDate = 'Expected delivery date is required';
      valid = false;
    }

    const deliveryDate = new Date(details.expectedDeliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deliveryDate < today) {
      newErrors.expectedDeliveryDate = 'Expected delivery date cannot be in the past';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      toast.error('Quantity must be at least 1', {
        position: "bottom-right",
        autoClose: 3000
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemId, change: newQuantity })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update quantity');
      }

      const updatedCart = await response.json();
      setCartItems(updatedCart.items);
      toast.success(`Updated quantity successfully`, {
        position: "bottom-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(`Failed to update quantity: ${error.message || 'Server not responding'}`, {
        position: "bottom-right",
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (itemCode) => {
    setIsLoading(true);
    try {
      const updated = cartItems.filter(item => item.itemCode !== itemCode);
      const response = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customerEmail: user.email, items: updated })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove item');
      }

      setCartItems(updated);
      const removedItem = cartItems.find(item => item.itemCode === itemCode);
      toast.success(`Removed ${removedItem.productName} from cart`, {
        position: "bottom-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(`Failed to remove item: ${error.message || 'Server not responding'}`, {
        position: "bottom-right",
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty', {
        position: "bottom-right",
        autoClose: 3000
      });
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!validateDetails()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: cartItems,
          phoneNumber: details.phoneNumber,
          expectedDeliveryDate: details.expectedDeliveryDate,
          businessName: details.businessName,
          orderPlacerName: details.orderPlacerName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place order');
      }

      toast.success("Order placed successfully! Redirecting to orders page...", {
        position: "bottom-right",
        autoClose: 3000
      });
      setCartItems([]);
      setConfirmOpen(false);
      navigate('/customer/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(`Failed to place order: ${error.message || 'Server not responding'}`, {
        position: "bottom-right",
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ position: 'relative', p: 3, minHeight: '100vh', backgroundColor: 'transparent' }}>
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <ParticlesBackground />
        </Box>

        <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>My Cart</Typography>

        {cartItems.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: '#888' }}>
            Your cart is empty.
          </Typography>
        ) : (
          <>
            <TableContainer 
              component={Paper} 
              sx={{ backgroundColor: 'rgba(240,248,255,0.85)', borderRadius: '8px', overflowX: 'auto' }}
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
                          onChange={(e) => handleQuantityChange(item.itemCode, parseInt(e.target.value))}
                          inputProps={{ min: 1 }}
                          sx={{ width: '80px' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemove(item.itemCode)}
                          disabled={isLoading}
                          sx={{ textTransform: 'none' }}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                onClick={handlePlaceOrder}
                disabled={isLoading}
                sx={{ textTransform: 'none' }}
              >
                Place Order
              </Button>
            </Box>
          </>
        )}

        <Dialog
          open={confirmOpen}
          onClose={() => !isLoading && setConfirmOpen(false)}
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 2,
              p: 2,
              maxWidth: 400
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleOutlineIcon color="primary" />
            Confirm Order
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please provide your details before confirming the order.
            </Typography>
            <TextField
              label="Business Name"
              type="text"
              name="businessName"
              value={details.businessName}
              onChange={handleDetailsChange}
              fullWidth
              margin="dense"
              error={Boolean(errors.businessName)}
              helperText={errors.businessName}
            />
            <TextField
              label="Order Placer Name"
              type="text"
              name="orderPlacerName"
              value={details.orderPlacerName}
              onChange={handleDetailsChange}
              fullWidth
              margin="dense"
              error={Boolean(errors.orderPlacerName)}
              helperText={errors.orderPlacerName}
            />
            <TextField
              label="Phone Number"
              type="tel"
              name="phoneNumber"
              value={details.phoneNumber}
              onChange={handleDetailsChange}
              fullWidth
              margin="dense"
              error={Boolean(errors.phoneNumber)}
              helperText={errors.phoneNumber}
            />
            <TextField
              label="Expected Delivery Date"
              type="date"
              name="expectedDeliveryDate"
              value={details.expectedDeliveryDate}
              onChange={handleDetailsChange}
              fullWidth
              margin="dense"
              error={Boolean(errors.expectedDeliveryDate)}
              helperText={errors.expectedDeliveryDate}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setConfirmOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmOrder}
              variant="contained"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Confirm Order'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Backdrop
        sx={{ 
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 2
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <ToastContainer
        key={toastContainerKey}
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </motion.div>
  );
};

export default CartPage;
