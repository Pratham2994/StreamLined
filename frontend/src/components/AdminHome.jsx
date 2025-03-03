import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { motion } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';

function AdminHome() {
  const [orders, setOrders] = useState([]);
  const [editStatus, setEditStatus] = useState({});

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

  const handleStatusChange = (orderId, newStatus) => {
    setEditStatus(prev => ({ ...prev, [orderId]: newStatus }));
  };

  const updateOrderStatus = async (orderId) => {
    const newStatus = editStatus[orderId];
    if (!newStatus) return;
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev =>
          prev.map(order => (order._id === orderId ? updatedOrder : order))
        );
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
      {/* Particles Background */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <ParticlesBackground />
      </Box>
      {/* Main Content Container with transparent background */}
      <Box sx={{ position: 'relative', p: { xs: 1, sm: 3, md: 4 }, minHeight: '100vh', backgroundColor: 'transparent' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#2980b9', fontWeight: 'bold', textAlign: 'center' }}>
          Admin Dashboard - Orders
        </Typography>
        {orders.length === 0 ? (
          <Typography variant="h6" sx={{ textAlign: 'center', color: '#777' }}>
            No orders found.
          </Typography>
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
                  {/* Order Header */}
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Order ID: {order._id}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: '#555' }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  {/* Order Basic Details */}
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Customer Email:</strong> {order.customerEmail}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Phone Number:</strong> {order.phoneNumber ? order.phoneNumber : 'N/A'}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Expected Delivery Date:</strong>{" "}
                    {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                  {/* Order Status */}
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        label="Status"
                        value={editStatus[order._id] || order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                      </Select>
                    </FormControl>
                    <Button 
                      variant="contained" 
                      onClick={() => updateOrderStatus(order._id)} 
                      sx={{ textTransform: 'none' }}
                    >
                      Update Status
                    </Button>
                  </Box>
                  {/* Order Items */}
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Items:
                  </Typography>
                  <TableContainer component={Paper} sx={{ mb: 2, backgroundColor: 'transparent', boxShadow: 'none' }}>
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
                  {/* Order Actions */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      color="error" 
                      onClick={() => handleDelete(order._id)} 
                      sx={{ textTransform: 'none' }}
                    >
                      Delete Order
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
}

export default AdminHome;
