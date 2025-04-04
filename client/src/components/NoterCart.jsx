import React, { useState, useEffect, useContext, useRef } from 'react';
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
  Backdrop,
  Grid,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from './ParticlesBackground';
import { AuthContext } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import axiosInstance from '../utils/axios';

const NoterCart = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const toastQueue = useRef([]);
  const animationCompleted = useRef(false);

  const [details, setDetails] = useState({
    customerEmail: localStorage.getItem('noterCustomerEmail') || '',
    businessName: localStorage.getItem('noterBusinessName') || '',
    orderPlacerName: localStorage.getItem('noterOrderPlacerName') || '',
    phoneNumber: localStorage.getItem('noterPhoneNumber') || '',
    expectedDeliveryDate: localStorage.getItem('noterExpectedDeliveryDate') || ''
  });

  const [errors, setErrors] = useState({
    customerEmail: '',
    businessName: '',
    orderPlacerName: '',
    phoneNumber: '',
    expectedDeliveryDate: ''
  });
  
  const processPendingToasts = () => {
    if (isMounted && toastQueue.current.length > 0) {
      toastQueue.current.forEach(({ message, type }) => {
        if (type === 'success') {
          toast.success(message);
        } else if (type === 'error') {
          toast.error(message);
        } else {
          toast.info(message);
        }
      });
      toastQueue.current = [];
    }
  };

  const showToast = (message, type = 'success') => {
    if (!isMounted) {
      toastQueue.current.push({ message, type });
      return;
    }

    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast.info(message);
    }
  };
  
  useEffect(() => {
    if (user && user.email) {
      fetchCart();
    }
    
    const timer = setTimeout(() => {
      setIsMounted(true);
      processPendingToasts();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      toast.dismiss();
    };
  }, [user]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/api/cart/${user.email}`);
      setCartItems(response.data.items || []);
    } catch (error) {
      showToast(`Failed to load cart: ${error.response?.data?.message || 'Server not responding'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const validateDetails = () => {
    let valid = true;
    const newErrors = {
      customerEmail: '',
      businessName: '',
      orderPlacerName: '',
      phoneNumber: '',
      expectedDeliveryDate: ''
    };

    if (!details.customerEmail.trim()) {
      newErrors.customerEmail = 'Customer email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(details.customerEmail)) {
      newErrors.customerEmail = 'Invalid email format';
      valid = false;
    }
    
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
    
    localStorage.setItem(`noter${name.charAt(0).toUpperCase() + name.slice(1)}`, value);
  };

  const handleQuantityChange = async (itemCode, newQuantity) => {
    if (newQuantity < 1) {
      showToast('Quantity must be at least 1', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const updatedItems = cartItems.map(item => 
        item.itemCode === itemCode ? { ...item, quantity: newQuantity } : item
      );
      
      await axiosInstance.post('/api/cart', {
        customerEmail: user.email,
        items: updatedItems
      });

      setCartItems(updatedItems);
      window.dispatchEvent(new Event('resize'));
      showToast('Quantity updated successfully');
    } catch (error) {
      showToast(`Failed to update quantity: ${error.response?.data?.message || 'Server not responding'}`, 'error');
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

      const removedItem = cartItems.find(item => item.itemCode === itemCode);
      setCartItems(updated);
      
      window.dispatchEvent(new Event('resize'));
      showToast(`Removed ${removedItem.productName} from cart`);
    } catch (error) {
      showToast(`Failed to remove item: ${error.response?.data?.message || 'Server not responding'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const incrementQuantity = (itemCode) => {
    const item = cartItems.find(item => item.itemCode === itemCode);
    if (item) {
      handleQuantityChange(itemCode, item.quantity + 1);
    }
  };

  const decrementQuantity = (itemCode) => {
    const item = cartItems.find(item => item.itemCode === itemCode);
    if (item && item.quantity > 1) {
      handleQuantityChange(itemCode, item.quantity - 1);
    }
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
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
        items: cartItems,
        customerEmail: details.customerEmail,
        phoneNumber: details.phoneNumber,
        expectedDeliveryDate: details.expectedDeliveryDate,
        businessName: details.businessName,
        orderPlacerName: details.orderPlacerName,
        noterEmail: user.email
      });

      setCartItems([]);
      setOrderSuccess(true);
      
      await axiosInstance.post('/api/cart', {
        customerEmail: user.email,
        items: []
      });
      
      showToast("Order placed successfully for " + details.customerEmail);
      
      setTimeout(() => {
        setConfirmOpen(false);
        setOrderSuccess(false);
        navigate('/noter');
      }, 2000);
    } catch (error) {
      showToast(`Failed to place order: ${error.response?.data?.message || 'Server not responding'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        animationCompleted.current = true;
        setIsMounted(true);
        processPendingToasts();
      }}
    >
      <Box sx={{ position: 'relative', p: 3, minHeight: '100vh' }}>
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <ParticlesBackground />
        </Box>
        
        <Typography variant="h4" sx={{ 
          mb: 3, 
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Noter Cart
        </Typography>
        
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
              onClick={() => navigate('/noter')}
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
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <Typography variant="h6">Order Items</Typography>
            </Box>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton size="small" onClick={() => decrementQuantity(item.itemCode)} disabled={item.quantity <= 1}>
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.itemCode, parseInt(e.target.value))}
                          inputProps={{ min: 1, style: { textAlign: 'center' } }}
                          size="small"
                          sx={{ width: '60px', mx: 1 }}
                        />
                        <IconButton size="small" onClick={() => incrementQuantity(item.itemCode)}>
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Remove Item">
                        <IconButton 
                          color="error" 
                          onClick={() => handleRemove(item.itemCode)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
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
            {orderSuccess ? "Order Placed Successfully!" : "Complete Order Details"}
          </DialogTitle>
          <DialogContent>
            {orderSuccess ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6">Order has been placed successfully!</Typography>
                <Typography sx={{ mt: 1 }}>
                  The order for {details.customerEmail} has been submitted.
                </Typography>
              </Box>
            ) : (
              <>
                <Typography sx={{ mb: 3, fontWeight: 'medium' }}>
                  As a Noter, you are placing an order on behalf of a customer.
                  Please provide the following details:
                </Typography>
                
                <TextField
                  fullWidth
                  margin="dense"
                  name="customerEmail"
                  label="Customer Email"
                  value={details.customerEmail}
                  onChange={handleDetailsChange}
                  error={!!errors.customerEmail}
                  helperText={errors.customerEmail}
                  required
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      margin="dense"
                      name="orderPlacerName"
                      label="Customer Name"
                      value={details.orderPlacerName}
                      onChange={handleDetailsChange}
                      error={!!errors.orderPlacerName}
                      helperText={errors.orderPlacerName}
                      required
                    />
                  </Grid>
                </Grid>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                  </Grid>
                </Grid>
              </>
            )}
          </DialogContent>
          {!orderSuccess && (
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button 
                onClick={() => setConfirmOpen(false)} 
                disabled={isLoading}
                startIcon={<CloseIcon />}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmOrder} 
                variant="contained" 
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={24} /> : null}
              >
                {isLoading ? "Processing..." : "Place Order"}
              </Button>
            </DialogActions>
          )}
        </Dialog>
        
        <ToastContainer 
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Box>
    </motion.div>
  );
};

export default NoterCart;
