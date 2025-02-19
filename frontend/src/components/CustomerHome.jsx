// src/components/CustomerHome.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

function CustomerHome() {
  const [orders, setOrders] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.email) {
      fetch(`http://localhost:3000/api/orders/${user.email}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setOrders(data));
    }
  }, [user]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Orders
      </Typography>
      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} md={6} key={order._id}>
            <Paper elevation={3} sx={{ p: 3 }} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography variant="h6">Order ID: {order._id}</Typography>
              <Typography variant="body1">Status: {order.status}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default CustomerHome;
