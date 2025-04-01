import React, { useState, useEffect, useRef } from 'react';
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
  MenuItem,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Backdrop,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import { motion } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TimelineIcon from '@mui/icons-material/Timeline';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import UpdateIcon from '@mui/icons-material/Update';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RefreshIcon from '@mui/icons-material/Refresh';

// Helper function to format dates as dd-mm-yyyy
const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Status chip colors
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return { bg: '#FFF4DE', text: '#FF9800' };
    case 'Approved': return { bg: '#E0F7FA', text: '#0097A7' };
    case 'Rejected': return { bg: '#FFEBEE', text: '#F44336' };
    case 'In Progress': return { bg: '#E8F5E9', text: '#4CAF50' };
    case 'Completed': return { bg: '#E8EAF6', text: '#3F51B5' };
    default: return { bg: '#EEEEEE', text: '#757575' };
  }
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
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const toastIdRef = useRef(null);
  const [tabValue, setTabValue] = useState(0); // 0: All Orders, 1: Pending, etc.

  // Initialize toast system with proper mounting
  useEffect(() => {
    // Set mounted state after a delay to ensure ToastContainer is fully initialized
    const timer = setTimeout(() => {
      setIsMounted(true);
      console.log("Component is mounted and ready for toasts");
    }, 1000);
    
    // Force a resize event to ensure ToastContainer is properly initialized
    window.dispatchEvent(new Event('resize'));
    
    return () => {
      clearTimeout(timer);
      // Clear any pending toasts when unmounting
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, []);

  // Function to safely show toast notifications
  const showToast = (message, type = 'success') => {
    // If component is not fully mounted, wait until it is
    if (!isMounted) {
      console.log("Waiting for component to mount before showing toast");
      setTimeout(() => showToast(message, type), 500);
      return;
    }
    
    const toastOptions = {
      position: "bottom-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light"
    };
    
    // Clear any existing toasts first
    toast.dismiss();
    
    // Show the toast with a slight delay
    setTimeout(() => {
      if (type === 'success') {
        toastIdRef.current = toast.success(message, toastOptions);
      } else {
        toastIdRef.current = toast.error(message, toastOptions);
      }
    }, 300);
  };

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/orders/all');
      const data = await res.json();
        const ordersArray = Array.isArray(data) ? data : [];
        ordersArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(ordersArray);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Error fetching orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Set status filter based on tab
    switch(newValue) {
      case 0: // All orders
        setStatusFilter('');
        break;
      case 1: // Pending
        setStatusFilter('Pending');
        break;
      case 2: // Approved
        setStatusFilter('Approved');
        break;
      case 3: // In Progress
        setStatusFilter('In Progress');
        break;
      case 4: // Completed
        setStatusFilter('Completed');
        break;
      case 5: // Rejected
        setStatusFilter('Rejected');
        break;
      default:
        setStatusFilter('');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      orderSearchTerm === '' ||
      order._id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.businessName?.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      order.items.some(item =>
        item.productName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(orderSearchTerm.toLowerCase())
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
        showToast('Tracking updated successfully');
        closeTrackingModal();
      } else {
        showToast('Failed to update tracking', 'error');
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
      showToast('Error updating tracking', 'error');
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
        showToast(`Order ${decision.toLowerCase()} successfully`);
      }
    } catch (error) {
      console.error('Error updating order decision:', error);
      showToast('Error updating order status', 'error');
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
          showToast('Order deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        showToast('Error deleting order', 'error');
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
        { header: 'Business', key: 'business', width: 20 },
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
          business: order.businessName,
          status: order.orderStatus,
          createdDate: formatDate(order.createdAt),
          products: order.items.map(item => `${item.productName} (${item.quantity})`).join(', '),
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
      
      showToast('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting orders:', error);
      showToast('Error exporting orders', 'error');
    }
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        // Set mounted to true once initial animation completes
        if (!isMounted) {
          setIsMounted(true);
          console.log("Animation complete, component ready for toasts");
        }
      }}
    >
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
      <ParticlesBackground />
      </Box>
      
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 4, 
            maxWidth: 1400, 
            mx: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px'
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 3, 
              color: 'primary.main', 
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
          Order Management Dashboard
        </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
              aria-label="order status tabs"
            >
              <Tab label="All Orders" />
              <Tab label="Pending" />
              <Tab label="Approved" />
              <Tab label="In Progress" />
              <Tab label="Completed" />
              <Tab label="Rejected" />
            </Tabs>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search Orders"
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                type="date"
                label="Filter by Date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title="Refresh Orders">
                <IconButton 
                  color="primary" 
                  onClick={refreshOrders} 
                  sx={{ border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: 1 }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Export to Excel">
          <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
            onClick={exportToCSV}
                  sx={{ flexGrow: 1 }}
          >
            Export to Excel
          </Button>
              </Tooltip>
            </Grid>
          </Grid>

          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={isLoading}
          >
            <CircularProgress color="inherit" />
          </Backdrop>

          {!isLoading && filteredOrders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6">No orders found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search criteria or filters
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ 
              backgroundColor: 'transparent',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
            <Table>
                <TableHead sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
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
                  {filteredOrders.map((order) => {
                    const statusStyle = getStatusColor(order.orderStatus);
                    return (
                      <TableRow key={order._id} 
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            transition: 'background-color 0.2s ease'
                          } 
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {order._id.substring(order._id.length - 8).toUpperCase()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{order.customerName}</Typography>
                          {order.businessName && (
                            <Typography variant="caption" color="text.secondary">
                              {order.businessName}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {order.items.slice(0, 2).map((item, idx) => (
                              <Typography key={idx} variant="body2" noWrap>
                                {item.productName} (x{item.quantity})
                              </Typography>
                            ))}
                            {order.items.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                + {order.items.length - 2} more item(s)
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                    <TableCell>
                          <Chip 
                            label={order.orderStatus} 
                            sx={{ 
                              backgroundColor: statusStyle.bg, 
                              color: statusStyle.text,
                              fontWeight: 'medium',
                              fontSize: '0.8rem'
                            }} 
                          />
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Update Tracking">
                              <IconButton 
                          size="small"
                                color="primary"
                          onClick={() => openTrackingModal(order, false)}
                        >
                                <TimelineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                        {order.orderStatus === 'Pending' && (
                          <>
                                <Tooltip title="Approve Order">
                                  <IconButton 
                              size="small"
                              color="success"
                              onClick={() => handleDecision(order._id, 'Approved')}
                            >
                                    <CheckCircleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="Reject Order">
                                  <IconButton 
                              size="small"
                              color="error"
                              onClick={() => handleDecision(order._id, 'Rejected')}
                            >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                          </>
                        )}
                            
                            <Tooltip title="Delete Order">
                              <IconButton 
                          size="small"
                          color="error"
                          onClick={() => handleDelete(order._id)}
                        >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </Paper>

        <Dialog 
          open={trackingModalOpen} 
          onClose={closeTrackingModal} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            pb: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShippingIcon color="primary" />
              <Typography variant="h6">Order Tracking</Typography>
            </Box>
            {selectedOrder && (
              <Chip 
                label={selectedOrder.orderStatus} 
                size="small"
                sx={{ 
                  backgroundColor: getStatusColor(selectedOrder.orderStatus).bg, 
                  color: getStatusColor(selectedOrder.orderStatus).text,
                  fontWeight: 'medium'
                }} 
              />
            )}
          </DialogTitle>
          
          <DialogContent sx={{ mt: 2 }}>
            {selectedOrder && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">Order Details</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Customer</Typography>
                    <Typography variant="body1">{selectedOrder.customerName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Business</Typography>
                    <Typography variant="body1">{selectedOrder.businessName || 'N/A'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Order Date</Typography>
                    <Typography variant="body1">{formatDate(selectedOrder.createdAt)}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Contact</Typography>
                    <Typography variant="body1">{selectedOrder.phoneNumber || 'N/A'}</Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
              </Box>
            )}
            
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
              {readOnlyMode ? 'Tracking Information' : 'Update Tracking Information'}
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Stage</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Planned Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actual Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trackingData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.stage}</TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          value={item.plannedDate || ''}
                          onChange={(e) => handleTrackingChange(index, 'plannedDate', e.target.value)}
                          disabled={readOnlyMode}
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          value={item.actualDate || ''}
                          onChange={(e) => handleTrackingChange(index, 'actualDate', e.target.value)}
                          disabled={readOnlyMode}
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          
          <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Button 
              onClick={closeTrackingModal} 
              variant="outlined"
              startIcon={<CloseIcon />}
            >
              Close
            </Button>
            {!readOnlyMode && (
              <Button 
                onClick={updateTracking} 
                variant="contained" 
                color="primary"
                startIcon={<SaveIcon />}
              >
                Save Changes
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
      
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </motion.div>
  );
}

export default AdminHome;
