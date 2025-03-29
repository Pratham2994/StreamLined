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
  Alert,
  CircularProgress,
  Backdrop
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

const NoterCart = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [emptyCartSnackbarOpen, setEmptyCartSnackbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastContainerKey, setToastContainerKey] = useState(0);
  const [details, setDetails] = useState({
    customerEmail: '',
    businessName: '',
    orderPlacerName: '',
    phoneNumber: '',
    expectedDeliveryDate: ''
  });
  const [errors, setErrors] = useState({
    customerEmail: '',
    businessName: '',
    orderPlacerName: '',
    phoneNumber: '',
    expectedDeliveryDate: ''
  });

  // Utility: if a noter has submitted details, use the stored customer email; otherwise fallback to user.email
  const getNoterEmail = () => localStorage.getItem('noterCustomerEmail') || (user && user.email);

  // Similarly, get extra noter details
  const getBusinessName = () => localStorage.getItem('noterBusinessName') || "";
  const getOrderPlacerName = () => localStorage.getItem('noterOrderPlacerName') || "";
  const getPhoneNumber = () => localStorage.getItem('noterPhoneNumber') || "";
  const getExpectedDeliveryDate = () => localStorage.getItem('noterExpectedDeliveryDate') || "";

  // Ensure the container dimensions are updated
  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  // Use the email from localStorage if available for noter orders
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
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error(error.message || 'Error loading cart', {
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
      customerEmail: '',
      businessName: '',
      orderPlacerName: '',
      phoneNumber: '',
      expectedDeliveryDate: ''
    };

    if (!/\S+@\S+\.\S+/.test(details.customerEmail)) {
      newErrors.customerEmail = 'Invalid email format';
      valid = false;
    }
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
        throw new Error(error.message || 'Failed to update cart');
      }

      const updatedCart = await response.json();
      setCartItems(updatedCart.items);
      toast.success('Quantity updated', {
        position: "bottom-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(error.message || 'Error updating cart', {
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
        throw new Error('Failed to remove item');
      }

      setCartItems(updated);
      toast.success('Item removed from cart', {
        position: "bottom-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(error.message || 'Failed to remove item', {
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
          customerEmail: details.customerEmail,
          phoneNumber: details.phoneNumber,
          expectedDeliveryDate: details.expectedDeliveryDate,
          businessName: details.businessName,
          orderPlacerName: details.orderPlacerName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error placing order');
      }

      toast.success("Order placed successfully!", {
        position: "bottom-right",
        autoClose: 3000
      });
      setCartItems([]);
      setConfirmOpen(false);
      navigate('/noter');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.message || "Error placing order", {
        position: "bottom-right",
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmptyCartSnackbarClose = () => {
    setEmptyCartSnackbarOpen(false);
  };

  // Add responsive styles
  const responsiveStyles = {
    container: {
      position: 'relative',
      p: { xs: 1, sm: 2, md: 3 },
      minHeight: '100vh',
      backgroundColor: 'transparent'
    },
    title: {
      mb: { xs: 1, sm: 2 },
      textAlign: 'center',
      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
    },
    emptyCartText: {
      textAlign: 'center',
      color: '#888',
      fontSize: { xs: '1rem', sm: '1.1rem' }
    },
    tableContainer: {
      backgroundColor: 'rgba(240,248,255,0.85)',
      borderRadius: '8px',
      overflowX: 'auto',
      mx: { xs: 1, sm: 2 }
    },
    table: {
      minWidth: { xs: 800, sm: 1000 },
      '& .MuiTableCell-root': {
        px: { xs: 1, sm: 2 },
        py: { xs: 1, sm: 1.5 }
      }
    },
    quantityField: {
      width: { xs: '60px', sm: '80px' }
    },
    removeButton: {
      textTransform: 'none',
      minWidth: { xs: '60px', sm: '80px' }
    },
    placeOrderButton: {
      textTransform: 'none',
      padding: { xs: '6px 16px', sm: '8px 24px' },
      mt: { xs: 2, sm: 4 }
    },
    dialog: {
      '& .MuiDialog-paper': {
        borderRadius: 3,
        p: { xs: 1, sm: 2 },
        maxWidth: { xs: '95%', sm: 400 },
        width: '90%'
      }
    },
    dialogTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      fontSize: { xs: '1.2rem', sm: '1.5rem' }
    },
    dialogContent: {
      '& .MuiTextField-root': {
        mb: { xs: 1, sm: 2 }
      }
    }
  };

  // Initialize Toastify with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      // Force a re-render of ToastContainer
      const event = new Event('resize');
      window.dispatchEvent(event);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Force a re-render of ToastContainer
  useEffect(() => {
    setToastContainerKey(prev => prev + 1);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={responsiveStyles.container}>
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <ParticlesBackground />
        </Box>
        <Typography variant="h4" sx={responsiveStyles.title}>Noter Cart</Typography>
        {cartItems.length === 0 ? (
          <Typography sx={responsiveStyles.emptyCartText}>Your cart is empty.</Typography>
        ) : (
          <>
            <TableContainer 
              component={Paper} 
              sx={responsiveStyles.tableContainer}
            >
              <Table sx={responsiveStyles.table}>
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
                          sx={responsiveStyles.quantityField}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          onClick={() => handleRemove(item.itemCode)}
                          disabled={isLoading}
                          sx={responsiveStyles.removeButton}
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
                sx={responsiveStyles.placeOrderButton}
              >
                Place Order
              </Button>
            </Box>
          </>
        )}
        <Dialog
          open={confirmOpen}
          onClose={() => !isLoading && setConfirmOpen(false)}
          sx={responsiveStyles.dialog}
        >
          <DialogTitle sx={responsiveStyles.dialogTitle}>
            <CheckCircleOutlineIcon color="primary" fontSize="large" />
            Confirm Order
          </DialogTitle>
          <DialogContent sx={responsiveStyles.dialogContent}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Please provide the customer details before placing the order.
            </Typography>
            <TextField
              label="Customer Email"
              type="email"
              name="customerEmail"
              value={details.customerEmail}
              onChange={handleDetailsChange}
              fullWidth
              margin="dense"
              error={Boolean(errors.customerEmail)}
              helperText={errors.customerEmail}
            />
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
          <DialogActions sx={{ justifyContent: 'center', p: { xs: 1, sm: 2 } }}>
            <Button onClick={() => setConfirmOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleConfirmOrder} variant="contained" disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : 'Confirm Order'}
            </Button>
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

export default NoterCart;
