import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';

const MyOrderPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user && user.email) {
      fetch(`http://localhost:3000/api/orders/${user.email}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(error => console.error('Error fetching orders:', error));
    }
  }, [user]);

  return (
    <Box sx={{ position: 'relative', p: 3, minHeight: '100vh' }}>
      {/* Particle Background */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <ParticlesBackground />
      </Box>
      
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>
        My Orders
      </Typography>
      
      {orders.length === 0 ? (
        <Typography sx={{ textAlign: 'center' }}>No orders found.</Typography>
      ) : (
        orders.map(order => (
          <Paper
            key={order._id}
            elevation={3}
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: 'rgba(240,248,255,0.85)', // 85% opacity with a slight blue tint
              borderRadius: '8px'
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Order ID: {order._id}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Order Date: {new Date(order.createdAt).toLocaleString()}
            </Typography>
            <TableContainer>
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
          </Paper>
        ))
      )}
    </Box>
  );
};

export default MyOrderPage;
