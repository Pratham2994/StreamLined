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
import axiosInstance from '../utils/axios';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
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
      const response = await axiosInstance.get(`/api/cart/${user.email}`);
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error(`Failed to load cart: ${error.response?.data?.message || 'Server not responding'}`, {
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
    } else if (details.businessName.length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters';
      valid = false;
    }
    
    if (!details.orderPlacerName.trim()) {
      newErrors.orderPlacerName = 'Order placer name is required';
      valid = false;
    } else if (details.orderPlacerName.length < 2) {
      newErrors.orderPlacerName = 'Name must be at least 2 characters';
      valid = false;
    }
    
    if (!details.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      valid = false;
    } else if (!/^\d{10}$/.test(details.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
      valid = false;
    }
    
    if (!details.expectedDeliveryDate.trim()) {
      newErrors.expectedDeliveryDate = 'Expected delivery date is required';
      valid = false;
    } else {
      const deliveryDate = new Date(details.expectedDeliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deliveryDate < today) {
        newErrors.expectedDeliveryDate = 'Expected delivery date cannot be in the past';
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = async (itemCode, newQuantity) => {
    const item = cartItems.find(item => item.itemCode === itemCode);
    const minQuantity = item?.minimumOrderQuantity || 1;

    if (newQuantity < minQuantity) {
      toast.error(`Minimum order quantity for ${item.productName} is ${minQuantity}`, {
        position: "bottom-right",
        autoClose: 3000
      });
      return;
    }

    setIsLoading(true);
    try {
      // Find the item and update its quantity
      const updatedItems = cartItems.map(item => 
        item.itemCode === itemCode 
          ? { ...item, quantity: Math.max(minQuantity, newQuantity) }
          : item
      );

      // Update cart with all items
      const { data } = await axiosInstance.post('/api/cart', {
        customerEmail: user.email,
        items: updatedItems
      });

      setCartItems(data.items || []);
      toast.success(`Updated quantity successfully`, {
        position: "bottom-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(`Failed to update quantity: ${error.response?.data?.message || 'Server not responding'}`, {
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
      await axiosInstance.post('/api/cart', {
        customerEmail: user.email,
        items: updated
      });

      setCartItems(updated);
      const removedItem = cartItems.find(item => item.itemCode === itemCode);
      toast.success(`Removed ${removedItem.productName} from cart`, {
        position: "bottom-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(`Failed to remove item: ${error.response?.data?.message || 'Server not responding'}`, {
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
      await axiosInstance.post('/api/orders', {
        customerEmail: user.email,
        items: cartItems,
        phoneNumber: details.phoneNumber,
        expectedDeliveryDate: details.expectedDeliveryDate,
        businessName: details.businessName,
        orderPlacerName: details.orderPlacerName
      });

      // Clear cart and show success message
      setCartItems([]);
      setOrderSuccess(true);
      
      // Clear cart in the database
      await axiosInstance.post('/api/cart', {
        customerEmail: user.email,
        items: []
      });
      
      toast.success("Order placed successfully!", {
        position: "bottom-right",
        autoClose: 3000
      });
      
      // Close the dialog and redirect to orders page after a short delay
      setTimeout(() => {
        setConfirmOpen(false);
        setOrderSuccess(false);
        navigate('/customer/orders');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(`Failed to place order: ${error.response?.data?.message || 'Server not responding'}`, {
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
      <Box sx={{ position: 'relative', p: 3, minHeight: '100vh' }}>
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <ParticlesBackground />
        </Box>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>Shopping Cart</Typography>
        
        {isLoading && (
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={true}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        )}

        {cartItems.length === 0 ? (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              maxWidth: 800,
              mx: 'auto',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>Your cart is empty</Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/customer')}
              sx={{ mt: 2 }}
            >
              Browse Products
            </Button>
          </Paper>
        ) : (
          <TableContainer 
            component={Paper} 
            sx={{ 
              maxWidth: 1200, 
              mx: 'auto',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cartItems.map((item) => (
                  <TableRow key={item.itemCode}>
                    <TableCell>{item.itemCode}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.drawingCode}</TableCell>
                    <TableCell>{item.revision}</TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.itemCode, parseInt(e.target.value))}
                        inputProps={{ 
                          min: item.minimumOrderQuantity || 1, 
                          style: { textAlign: 'center' }
                        }}
                        size="small"
                        sx={{ width: '80px' }}
                        helperText={`Min: ${item.minimumOrderQuantity || 1}`}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        color="error" 
                        onClick={() => handleRemove(item.itemCode)}
                        size="small"
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="contained" 
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0}
                sx={{ 
                  minWidth: 150,
                  textTransform: 'none',
                  fontSize: '1rem',
                  py: 1
                }}
              >
                Place Order
              </Button>
            </Box>
          </TableContainer>
        )}

        <Dialog 
          open={confirmOpen} 
          onClose={() => !isLoading && setConfirmOpen(false)} 
          fullWidth 
          maxWidth="sm"
        >
          <DialogTitle>
            {orderSuccess ? "Order Placed Successfully!" : "Complete Your Order"}
          </DialogTitle>
          <DialogContent>
            {orderSuccess ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6">Your order has been placed!</Typography>
                <Typography sx={{ mt: 1 }}>
                  You will be redirected to your orders page shortly.
                </Typography>
              </Box>
            ) : (
              <>
                <Typography sx={{ mb: 2 }}>
                  Please provide the following details to place your order:
                </Typography>
                <TextField
                  fullWidth
                  margin="dense"
                  name="businessName"
                  label="Business Name"
                  value={details.businessName}
                  onChange={handleDetailsChange}
                  error={!!errors.businessName}
                  helperText={errors.businessName}
                  required
                />
                <TextField
                  fullWidth
                  margin="dense"
                  name="orderPlacerName"
                  label="Your Name"
                  value={details.orderPlacerName}
                  onChange={handleDetailsChange}
                  error={!!errors.orderPlacerName}
                  helperText={errors.orderPlacerName}
                  required
                />
                <TextField
                  fullWidth
                  margin="dense"
                  name="phoneNumber"
                  label="Phone Number (10 digits)"
                  value={details.phoneNumber}
                  onChange={handleDetailsChange}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  required
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  name="expectedDeliveryDate"
                  label="Expected Delivery Date"
                  type="date"
                  value={details.expectedDeliveryDate}
                  onChange={handleDetailsChange}
                  error={!!errors.expectedDeliveryDate}
                  helperText={errors.expectedDeliveryDate}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
          </DialogContent>
          {!orderSuccess && (
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
                {isLoading ? <CircularProgress size={24} /> : "Confirm Order"}
              </Button>
            </DialogActions>
          )}
        </Dialog>
        <ToastContainer key={toastContainerKey} />
      </Box>
    </motion.div>
  );
};

export default CartPage;
