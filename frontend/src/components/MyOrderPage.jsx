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
  MenuItem
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';

const MyOrderPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (user && user.email) {
      fetch(`http://localhost:3000/api/orders/${user.email}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(error => console.error('Error fetching orders:', error));
    }
  }, [user]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      orderSearchTerm === '' ||
      order.items.some(item =>
        item.productName.toLowerCase().includes(orderSearchTerm.toLowerCase())
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

  const renderStatusLabel = (status) => {
    let color = '#555';
    if (status === 'Accepted') color = 'green';
    else if (status === 'Rejected') color = 'red';
    else if (status === 'Pending') color = '#ff8c00';
    return (
      <Typography variant="body1" sx={{ color, fontWeight: 'bold' }}>
        {status}
      </Typography>
    );
  };

  return (
    <Box sx={{ position: 'relative', p: 3, minHeight: '100vh', backgroundColor: 'transparent' }}>
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <ParticlesBackground />
      </Box>
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>My Orders</Typography>
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
        <TextField
          label="Search By Product Name"
          variant="outlined"
          size="small"
          value={orderSearchTerm}
          onChange={(e) => setOrderSearchTerm(e.target.value)}
        />
        <TextField
          select
          label="Order Status"
          variant="outlined"
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Accepted">Accepted</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
          <MenuItem value="Completed">Completed</MenuItem>
        </TextField>
        <TextField
          label="Order Date"
          type="date"
          variant="outlined"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </Box>
      {filteredOrders.length === 0 ? (
        <Typography sx={{ textAlign: 'center' }}>No orders found.</Typography>
      ) : (
        filteredOrders.map(order => (
          <Paper key={order._id} elevation={3} sx={{ p: 2, mb: 3, backgroundColor: 'rgba(240,248,255,0.85)', borderRadius: '8px' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Order ID: {order._id}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Order Date: {new Date(order.createdAt).toLocaleString()}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Status: {renderStatusLabel(order.orderStatus)}
            </Typography>
            <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 600 }}>
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
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <Button variant="outlined" onClick={() => openTrackingModal(order)} sx={{ textTransform: 'none' }}>
                View Tracking
              </Button>
            </Box>
          </Paper>
        ))
      )}

      <Dialog open={trackingModalOpen} onClose={closeTrackingModal} fullWidth maxWidth="sm">
        <DialogTitle>Order Tracking</DialogTitle>
        <DialogContent>
          {selectedOrder ? (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Order ID: {selectedOrder._id}
              </Typography>
              {selectedOrder.tracking && selectedOrder.tracking.length > 0 ? (
                <HorizontalTimeline
                  tracking={selectedOrder.tracking}
                  createdAt={selectedOrder.createdAt}
                />
              ) : (
                <Typography>No tracking information available.</Typography>
              )}
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTrackingModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyOrderPage;
