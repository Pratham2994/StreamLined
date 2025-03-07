import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';

function AdminHome() {
  const [orders, setOrders] = useState([]);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/orders/all')
      .then(res => res.json())
      .then(data => {
        const ordersArray = Array.isArray(data) ? data : [];
        ordersArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(ordersArray);
      })
      .catch(error => console.error('Error fetching orders:', error));
  }, []);

  const openTrackingModal = (order) => {
    setSelectedOrder(order);
    if (order.tracking && order.tracking.length > 0) {
      setTrackingData(order.tracking);
    } else {
      setTrackingData([
        { stage: 'Order Placed', plannedDate: '', actualDate: '' },
        { stage: 'Fabrication', plannedDate: '', actualDate: '' },
        { stage: 'Sheet Metal Processing', plannedDate: '', actualDate: '' },
        { stage: 'Quality Check', plannedDate: '', actualDate: '' },
        { stage: 'Dispatch', plannedDate: '', actualDate: '' },
        { stage: 'Delivered', plannedDate: '', actualDate: '' }
      ]);
    }
    setTrackingModalOpen(true);
  };

  const closeTrackingModal = () => {
    setTrackingModalOpen(false);
    setSelectedOrder(null);
    setTrackingData([]);
  };

  const handleTrackingChange = (index, field, value) => {
    const updated = trackingData.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setTrackingData(updated);
  };

  const updateTracking = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${selectedOrder._id}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking: trackingData })
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(order => (order._id === updatedOrder._id ? updatedOrder : order)));
        alert('Tracking updated successfully.');
        closeTrackingModal();
      } else {
        alert('Failed to update tracking.');
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      alert('Error updating tracking.');
    }
  };

  const renderStatusLabel = (status) => {
    let color = '#555';
    if (status === 'Accepted') color = 'green';
    else if (status === 'Rejected') color = 'red';
    else if (status === 'Pending') color = 'orange';
    return (
      <Typography variant="subtitle2" sx={{ color, fontWeight: 'bold' }}>
        {status}
      </Typography>
    );
  };

  const handleDecision = async (orderId, decision) => {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: decision })
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(order => (order._id === orderId ? updatedOrder : order)));
      } else {
        alert("Failed to update order status.");
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setOrders(prev => prev.filter(order => order._id !== orderId));
        } else {
          alert("Failed to delete order.");
        }
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  return (
    <>
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <ParticlesBackground />
      </Box>
      <Box sx={{ position: 'relative', p: { xs: 1, sm: 3, md: 4 }, minHeight: '100vh', backgroundColor: 'transparent' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#2980b9', fontWeight: 'bold', textAlign: 'center' }}>
          Admin Dashboard - Orders
        </Typography>
        {orders.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center' }}>
            No orders found.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 3,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(240,248,255,0.85)'
                  }}
                  component={motion.div}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Order ID: {order._id}
                    </Typography>
                    {renderStatusLabel(order.orderStatus)}
                    <Typography variant="subtitle2" sx={{ color: '#555' }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Customer Email:</strong> {order.customerEmail}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Phone Number:</strong> {order.phoneNumber ? order.phoneNumber : 'N/A'}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Expected Delivery Date:</strong> {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                  <Button variant="outlined" onClick={() => openTrackingModal(order)} sx={{ textTransform: 'none', mb: 2 }}>
                    View Tracking
                  </Button>
                  <TableContainer component={Paper} sx={{ mb: 2, backgroundColor: 'transparent', boxShadow: 'none', overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item Code</TableCell>
                          <TableCell>Product Name</TableCell>
                          <TableCell>Drawing Code</TableCell>
                          <TableCell>Revision</TableCell>
                          <TableCell>Quantity</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.itemCode}</TableCell>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>{item.drawingCode}</TableCell>
                            <TableCell>{item.revision}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    {order.orderStatus === 'Pending' ? (
                      <>
                        <Button variant="contained" color="success" sx={{ textTransform: 'none' }} onClick={() => handleDecision(order._id, 'Accepted')}>
                          Accept
                        </Button>
                        <Button variant="contained" color="error" sx={{ textTransform: 'none' }} onClick={() => handleDecision(order._id, 'Rejected')}>
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Button variant="contained" color="error" sx={{ textTransform: 'none' }} onClick={() => handleDelete(order._id)}>
                        Delete Order
                      </Button>
                    )}
                    <Button variant="outlined" sx={{ textTransform: 'none' }} onClick={() => openTrackingModal(order)}>
                      Update Tracking
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      <Dialog open={trackingModalOpen} onClose={closeTrackingModal} fullWidth maxWidth="sm">
        <DialogTitle>Order Tracking</DialogTitle>
        <DialogContent>
          {selectedOrder ? (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Order ID: {selectedOrder._id}
              </Typography>
              {trackingData.map((stage, index) => (
                <Box key={index} sx={{ mb: 2, borderBottom: '1px solid #ccc', pb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {stage.stage}
                  </Typography>
                  <TextField
                    label="Planned Date"
                    type="date"
                    value={stage.plannedDate ? new Date(stage.plannedDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleTrackingChange(index, 'plannedDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{ mt: 1 }}
                  />
                  <TextField
                    label="Actual Date"
                    type="date"
                    value={stage.actualDate ? new Date(stage.actualDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => handleTrackingChange(index, 'actualDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{ mt: 1 }}
                  />
                </Box>
              ))}
            </>
          ) : (
            <Typography>Loading tracking details...</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button onClick={closeTrackingModal} variant="outlined" sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button onClick={updateTracking} variant="contained" sx={{ textTransform: 'none', ml: 2 }}>
            Save Tracking
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AdminHome;
