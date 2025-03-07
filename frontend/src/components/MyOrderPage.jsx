import React, { useState, useEffect, useContext } from 'react';
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
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';

const MyOrderPage = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user && user.email) {
      fetch(`http://localhost:3000/api/orders/${user.email}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setOrders(data))
        .catch(error => console.error('Error fetching orders:', error));
    }
  }, [user]);

  const openTrackingModal = (order) => {
    setSelectedOrder(order);
    setTrackingModalOpen(true);
  };

  const closeTrackingModal = () => {
    setTrackingModalOpen(false);
    setSelectedOrder(null);
  };

  const getTrackingSteps = (order) => order.tracking || [];
  const getActiveStep = (steps) => {
    const index = steps.findIndex(step => !step.actualDate);
    return index === -1 ? steps.length : index;
  };

  return (
    <Box sx={{ position: 'relative', p: 3, minHeight: '100vh' }}>
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <ParticlesBackground />
      </Box>
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>My Orders</Typography>
      {orders.length === 0 ? (
        <Typography sx={{ textAlign: 'center' }}>No orders found.</Typography>
      ) : (
        orders.map(order => (
          <Paper key={order._id} elevation={3} sx={{ p: 2, mb: 3, backgroundColor: 'rgba(240,248,255,0.85)', borderRadius: '8px' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Order ID: {order._id}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Order Date: {new Date(order.createdAt).toLocaleString()}
            </Typography>
            <TableContainer sx={{ overflowX: 'auto' }}>
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
              {getTrackingSteps(selectedOrder).length > 0 ? (
                <>
                  <Stepper activeStep={getActiveStep(getTrackingSteps(selectedOrder))} alternativeLabel>
                    {getTrackingSteps(selectedOrder).map((step, index) => (
                      <Step key={index}>
                        <StepLabel>{step.stage}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  <Box sx={{ mt: 2 }}>
                    {getTrackingSteps(selectedOrder).map((step, index) => (
                      <Box key={index} sx={{ mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {step.stage}
                        </Typography>
                        <Typography variant="caption">
                          Planned Date: {step.plannedDate ? new Date(step.plannedDate).toLocaleDateString() : 'N/A'} | Actual Date: {step.actualDate ? new Date(step.actualDate).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Typography>No tracking information available.</Typography>
              )}
            </>
          ) : (
            <Typography>Loading tracking details...</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button variant="contained" onClick={closeTrackingModal} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyOrderPage;
