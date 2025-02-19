// src/components/NoterHome.jsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { motion } from 'framer-motion';

function NoterHome() {
  const [customerEmail, setCustomerEmail] = useState('');
  const [status, setStatus] = useState('Fabrication');
  const [notification, setNotification] = useState('');

  const createOrder = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerEmail, status })
      });
      if (response.ok) {
        setNotification('Order created successfully!');
      } else {
        setNotification('Failed to create order.');
      }
    } catch (err) {
      setNotification('Error creating order.');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Typography variant="h4" gutterBottom>
          Create Order
        </Typography>
        <TextField
          label="Customer Email"
          type="email"
          fullWidth
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={createOrder} sx={{ mt: 2 }}>
          Submit Order
        </Button>
        {notification && (
          <Typography variant="subtitle1" color="secondary" sx={{ mt: 2 }}>
            {notification}
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

export default NoterHome;
