import React, { useState, useEffect, useContext } from 'react';
import HorizontalTimeline from './HorizontalTimeline';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Chip,
  Tooltip,
  IconButton,
  CircularProgress,
  Divider,
  Fade
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';
import TimelineIcon from '@mui/icons-material/Timeline';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axios';

const MyOrderPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      const timer = setTimeout(() => {
        fetchOrders();
      }, 100); // Delay by 300ms
      return () => clearTimeout(timer);
    }
  }, [user?.email]);
  

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/api/orders/${user.email}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(`Failed to load orders: ${error.response?.data?.message || 'Server not responding'}`, {
        position: "bottom-right",
        autoClose: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      orderSearchTerm === '' ||
      order.items.some(item =>
        item.productName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(orderSearchTerm.toLowerCase())
      );
    const matchesStatus = statusFilter ? order.orderStatus === statusFilter : true;
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
    const matchesDate = dateFilter ? orderDate === dateFilter : true;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const openTrackingModal = (order) => {
    setSelectedOrder(order);
    setTrackingModalOpen(true);
  };

  const closeTrackingModal = () => {
    setTrackingModalOpen(false);
    setSelectedOrder(null);
  };

  const handleClearFilters = () => {
    setOrderSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Accepted': return '#4caf50';
      case 'Rejected': return '#f44336';
      case 'Pending': return '#ff9800';
      case 'Completed': return '#2196f3';
      default: return '#757575';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        
        <Typography variant="h4" sx={{ 
          mb: 3, 
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          My Orders
        </Typography>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px'
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search Products/Item Code"
                variant="outlined"
                size="small"
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Order Status"
                variant="outlined"
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Accepted">Accepted</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Order Date"
                type="date"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              <Button 
                variant="outlined" 
                onClick={handleClearFilters}
                disabled={!orderSearchTerm && !statusFilter && !dateFilter}
                startIcon={<CloseIcon />}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '8px'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>No orders found</Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {orders.length > 0 
                ? "Try adjusting your search filters" 
                : "Your order history is empty. Items you order will appear here."}
            </Typography>
            {orders.length === 0 && (
              <Button 
                variant="contained" 
                onClick={() => window.location.href = '/customer'}
                sx={{ mt: 3 }}
              >
                Browse Products
              </Button>
            )}
          </Paper>
        ) : (
          <Fade in={true}>
            <Box>
              {filteredOrders.map(order => (
                <Paper 
                  key={order._id} 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Order #{order._id.slice(-8)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed on {formatDate(order.createdAt)}
                      </Typography>
                    </Box>
                    <Chip 
                      label={order.orderStatus} 
                      sx={{ 
                        bgcolor: getStatusColor(order.orderStatus),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />
                  
                  <TableContainer sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item Code</TableCell>
                          <TableCell>Product Name</TableCell>
                          <TableCell align="center">Quantity</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.itemCode}</TableCell>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell align="center">{item.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Box>
                      <Typography variant="body2">
                        <strong>Business:</strong> {order.businessName}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Contact:</strong> {order.orderPlacerName}, {order.phoneNumber}
                      </Typography>
                    </Box>
                    <Tooltip title="View Tracking Information">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => openTrackingModal(order)}
                        startIcon={<TimelineIcon />}
                        sx={{ textTransform: 'none' }}
                      >
                        Track Order
                      </Button>
                    </Tooltip>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Fade>
        )}

        <Dialog 
          open={trackingModalOpen} 
          onClose={closeTrackingModal} 
          fullWidth 
          maxWidth="md"
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1
          }}>
            <Typography variant="h6">
              Order Tracking
              {selectedOrder && (
                <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
                  (Order #{selectedOrder._id.slice(-8)})
                </Typography>
              )}
            </Typography>
            <IconButton onClick={closeTrackingModal} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent>
            {selectedOrder ? (
              <>
                <Box sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Status:</strong>{' '}
                        <Chip 
                          label={selectedOrder.orderStatus}
                          size="small"
                          sx={{ 
                            bgcolor: getStatusColor(selectedOrder.orderStatus),
                            color: 'white'
                          }}
                        />
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Expected Delivery:</strong>{' '}
                        {selectedOrder.expectedDeliveryDate 
                          ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString() 
                          : 'Not specified'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                
                {selectedOrder.tracking && selectedOrder.tracking.length > 0 ? (
                  <HorizontalTimeline
                    tracking={selectedOrder.tracking}
                    createdAt={selectedOrder.createdAt}
                  />
                ) : (
                  <HorizontalTimeline tracking={[]} createdAt={null} />
                )}
              </>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={closeTrackingModal} 
              variant="outlined"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        
        <ToastContainer />
      </Box>
    </motion.div>
  );
};

export default MyOrderPage;
