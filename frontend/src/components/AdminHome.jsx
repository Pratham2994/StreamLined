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
  Alert,
  MenuItem
} from '@mui/material';
import { motion } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';

function AdminHome() {
  const [orders, setOrders] = useState([]);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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
    else if (status === 'Pending') color = '#ff8c00';
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

  const exportToCSV = () => {
    if (orders.length === 0) {
      alert("No orders to export.");
      return;
    }
    
    const maxItems = orders.reduce((max, order) => {
      const itemCount = order.items ? order.items.length : 0;
      return itemCount > max ? itemCount : max;
    }, 0);
    
    const csvRows = [];
    const baseHeaders = [
      'Order ID',
      'Customer Email',
      'Business Name',
      'Order Placer Name',
      'Phone Number',
      'Expected Delivery Date',
      'Order Status',
      'Created At',
      'Updated At',
      'Tracking'
    ];
    
    const itemHeaders = [];
    for (let i = 1; i <= maxItems; i++) {
      itemHeaders.push(`Item ${i} Code`);
      itemHeaders.push(`Item ${i} Product Name`);
      itemHeaders.push(`Item ${i} Drawing Code`);
      itemHeaders.push(`Item ${i} Revision`);
      itemHeaders.push(`Item ${i} Quantity`);
    }
    
    csvRows.push([...baseHeaders, ...itemHeaders].join(','));
    
    orders.forEach(order => {
      const orderId = order._id;
      const customerEmail = order.customerEmail;
      const businessName = order.businessName || "";
      const orderPlacerName = order.orderPlacerName || "";
      const phoneNumber = order.phoneNumber || "";
      const expectedDeliveryDate = order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : "";
      const orderStatus = order.orderStatus;
      const createdAt = order.createdAt ? new Date(order.createdAt).toLocaleString() : "";
      const updatedAt = order.updatedAt ? new Date(order.updatedAt).toLocaleString() : "";
      const trackingStr = order.tracking && Array.isArray(order.tracking)
        ? order.tracking.map(t => {
            if (t.stage === 'Order Placed') {
              return `${t.stage} (Placed on ${new Date(order.createdAt).toLocaleDateString()})`;
            }
            return `${t.stage} (Planned: ${t.plannedDate ? new Date(t.plannedDate).toLocaleDateString() : ""}, Actual: ${t.actualDate ? new Date(t.actualDate).toLocaleDateString() : ""})`;
          }).join("; ")
        : "";
      
      const baseData = [
        orderId,
        customerEmail,
        businessName,
        orderPlacerName,
        phoneNumber,
        expectedDeliveryDate,
        orderStatus,
        createdAt,
        updatedAt,
        trackingStr
      ];
      
      const itemsData = [];
      for (let i = 0; i < maxItems; i++) {
        if (order.items && order.items[i]) {
          const item = order.items[i];
          itemsData.push(item.itemCode);
          itemsData.push(item.productName);
          itemsData.push(item.drawingCode || "");
          itemsData.push(item.revision || "");
          itemsData.push(item.quantity);
        } else {
          itemsData.push("", "", "", "", "");
        }
      }
      
      const row = [...baseData, ...itemsData];
      const formattedRow = row.map(field => {
        if (field == null) return "";
        let str = field.toString();
        str = str.replace(/"/g, '""');
        if (str.search(/("|,|\n)/g) >= 0) {
          str = `"${str}"`;
        }
        return str;
      });
      
      csvRows.push(formattedRow.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'orders_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
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
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button variant="contained" onClick={exportToCSV} sx={{ textTransform: 'none' }}>
            Export Orders
          </Button>
        </Box>
        {filteredOrders.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center' }}>
            No orders found.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredOrders.map((order) => (
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
                  {order.orderStatus === 'Accepted' && (
                    <Button variant="outlined" sx={{ textTransform: 'none', mb: 2, ml: 2 }} onClick={() => openTrackingModal(order)}>
                      Update Tracking
                    </Button>
                  )}
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
          {selectedOrder && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Order ID: {selectedOrder._id}
              </Typography>
              {trackingData.map((stage, index) => (
                <Box key={index} sx={{ mb: 3, borderBottom: '1px solid #ccc', pb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {stage.stage}
                  </Typography>
                  {stage.stage === 'Order Placed' ? (
                    <Typography variant="body2">
                      Order Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="Planned Date"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={
                          stage.plannedDate
                            ? new Date(stage.plannedDate).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => handleTrackingChange(index, 'plannedDate', e.target.value)}
                      />
                      <TextField
                        label="Actual Date"
                        type="date"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={
                          stage.actualDate
                            ? new Date(stage.actualDate).toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) => handleTrackingChange(index, 'actualDate', e.target.value)}
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeTrackingModal}>Cancel</Button>
          <Button onClick={updateTracking} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AdminHome;
