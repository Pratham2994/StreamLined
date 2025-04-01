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
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper function to format dates as dd-mm-yyyy
const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

function AdminHome() {
  const [orders, setOrders] = useState([]);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [readOnlyMode, setReadOnlyMode] = useState(true);
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

  const openTrackingModal = (order, readOnly = true) => {
    setSelectedOrder(order);
    setReadOnlyMode(readOnly);
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
    setReadOnlyMode(true);
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
        toast.success('Tracking updated successfully');
        closeTrackingModal();
      } else {
        toast.error('Failed to update tracking');
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast.error('Error updating tracking');
    }
  };

  const handleDecision = async (orderId, decision) => {
    try {
      const response = await fetch(`http://localhost:3000/api/orders/${orderId}/decision`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision })
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(order => (order._id === updatedOrder._id ? updatedOrder : order)));
        toast.success(`Order ${decision.toLowerCase()} successfully`);
      }
    } catch (error) {
      console.error('Error updating order decision:', error);
      toast.error('Error updating order status');
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
          toast.success('Order deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Error deleting order');
      }
    }
  };

  const exportToCSV = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Orders');

      // Define columns
      worksheet.columns = [
        { header: 'Order ID', key: 'orderId', width: 15 },
        { header: 'Customer', key: 'customer', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Created Date', key: 'createdDate', width: 15 },
        { header: 'Products', key: 'products', width: 40 },
        { header: 'Total Items', key: 'totalItems', width: 10 }
      ];

      // Add data rows
      filteredOrders.forEach(order => {
        worksheet.addRow({
          orderId: order._id,
          customer: order.customerName,
          status: order.orderStatus,
          createdDate: formatDate(order.createdAt),
          products: order.items.map(item => item.productName).join(', '),
          totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0)
        });
      });

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Create blob and save file
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `orders_${formatDate(new Date())}.xlsx`);
      
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Error exporting orders');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ParticlesBackground />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom component="div" sx={{ color: 'primary.main', mb: 4 }}>
          Order Management Dashboard
        </Typography>

        <Paper sx={{ width: '100%', mb: 2, p: 2, backgroundColor: 'rgba(240,248,255,0.85)' }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search Orders"
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="date"
                label="Filter by Date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            onClick={exportToCSV}
            sx={{ mb: 2 }}
          >
            Export to Excel
          </Button>

          <TableContainer sx={{ backgroundColor: 'transparent' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Products</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      {order.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}
                    </TableCell>
                    <TableCell>{order.orderStatus}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openTrackingModal(order, false)}
                        >
                          Update Tracking
                        </Button>
                        {order.orderStatus === 'Pending' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleDecision(order._id, 'Approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleDecision(order._id, 'Rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={() => handleDelete(order._id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Dialog 
          open={trackingModalOpen} 
          onClose={closeTrackingModal} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(240,248,255,0.95)',
              backdropFilter: 'blur(10px)'
            }
          }}
        >
          <DialogTitle>Order Tracking</DialogTitle>
          <DialogContent>
            <TableContainer sx={{ backgroundColor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Stage</TableCell>
                    <TableCell>Planned Date</TableCell>
                    <TableCell>Actual Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trackingData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.stage}</TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          value={item.plannedDate}
                          onChange={(e) => handleTrackingChange(index, 'plannedDate', e.target.value)}
                          disabled={readOnlyMode}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          value={item.actualDate}
                          onChange={(e) => handleTrackingChange(index, 'actualDate', e.target.value)}
                          disabled={readOnlyMode}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeTrackingModal}>Cancel</Button>
            {!readOnlyMode && (
              <Button onClick={updateTracking} variant="contained" color="primary">
                Save Changes
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
      <ToastContainer position="bottom-right" />
    </motion.div>
  );
}

export default AdminHome;
