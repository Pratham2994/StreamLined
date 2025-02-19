// src/components/AdminHome.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { motion } from 'framer-motion';

function AdminHome() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setOrders(prev => prev.map(order => order._id === id ? { ...order, status: newStatus } : order));
      }
    } catch (err) {
      console.error('Failed to update order status.');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard - Manage Orders
      </Typography>
      <Grid container spacing={3}>
        {orders.map(order => (
          <Grid item xs={12} md={6} key={order._id}>
            <Paper elevation={3} sx={{ p: 3 }} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography variant="h6">
                Customer: {order.customerEmail}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Status: {order.status}
              </Typography>
              <Box>
                <Button variant="outlined" sx={{ mr: 1 }} onClick={() => updateStatus(order._id, 'Cutting')}>Cutting</Button>
                <Button variant="outlined" sx={{ mr: 1 }} onClick={() => updateStatus(order._id, 'Welding')}>Welding</Button>
                <Button variant="outlined" onClick={() => updateStatus(order._id, 'Assembly')}>Assembly</Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default AdminHome;
