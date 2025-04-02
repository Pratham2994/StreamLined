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
import VisibilityIcon from '@mui/icons-material/Visibility';

// Helper function to format dates as dd-mm-yyyy for display
const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper function to format date for input fields (yyyy-MM-dd)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ''; // Return empty string for invalid dates
  return date.toISOString().split('T')[0];
};

// Status chip colors
const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return { bg: '#FFF4DE', text: '#FF9800' };
    case 'Accepted': return { bg: '#E0F7FA', text: '#0097A7' };
    case 'In Progress': return { bg: '#E8F5E9', text: '#4CAF50' };
    case 'Completed': return { bg: '#E8EAF6', text: '#3F51B5' };
    case 'Rejected': return { bg: '#FFEBEE', text: '#F44336' };
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
  const [loadingStates, setLoadingStates] = useState({
    acceptOrder: false,
    rejectOrder: false,
    updateTracking: false,
    deleteOrder: false,
    exportToCSV: false,
    refreshOrders: false
  });
  const toastIdRef = useRef(null);
  const [tabValue, setTabValue] = useState(0); // 0: All Orders, 1: Pending, etc.

  // Initialize toast system with proper mounting
  useEffect(() => {
    // Set mounted state after a delay to ensure ToastContainer is fully initialized
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 1000);
    
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/all`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
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
      case 2: // Accepted
        setStatusFilter('Accepted');
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
    // Normalize search term
    const searchTermLower = orderSearchTerm.toLowerCase().trim();
    
    // Search matching
    const matchesSearch =
      !searchTermLower || // If no search term, show all
      order._id.toLowerCase().includes(searchTermLower) ||
      (order.orderPlacerName || '').toLowerCase().includes(searchTermLower) ||
      (order.customerName || '').toLowerCase().includes(searchTermLower) ||
      (order.businessName || '').toLowerCase().includes(searchTermLower) ||
      (order.customerEmail || '').toLowerCase().includes(searchTermLower) ||
      order.items.some(item =>
        (item.productName || '').toLowerCase().includes(searchTermLower) ||
        (item.itemCode || '').toLowerCase().includes(searchTermLower)
      );
    
    // Status matching - exact match required
    const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
    
    // Date matching - handle timezone consistently
    const matchesDate = !dateFilter || formatDateForInput(order.createdAt) === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const openTrackingModal = (order, readOnly = true) => {
    setSelectedOrder(order);
    // Only allow editing if the order is Accepted and we're not explicitly setting readOnly to true
    const shouldBeEditable = order.orderStatus === 'Accepted' && !readOnly;
    setReadOnlyMode(!shouldBeEditable);
    
    if (order.tracking && order.tracking.length > 0) {
      // Format dates for input fields
      const formattedTracking = order.tracking.map(item => ({
        ...item,
        plannedDate: formatDateForInput(item.plannedDate),
        actualDate: formatDateForInput(item.actualDate)
      }));
      setTrackingData(formattedTracking);
    } else {
      // Initialize with Order Placed using the order's creation date
      setTrackingData([
        { 
          stage: 'Order Placed', 
          plannedDate: formatDateForInput(order.createdAt),
          actualDate: formatDateForInput(order.createdAt)
        },
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

  const handleAcceptOrder = async (orderId) => {
    setLoadingStates(prev => ({ ...prev, acceptOrder: true }));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: 'Accepted' })
      });
      
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(order => 
          order._id === orderId ? updatedOrder : order
        ));
        showToast('Order accepted successfully');
      } else {
        showToast('Failed to accept order', 'error');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      showToast('Error accepting order', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, acceptOrder: false }));
    }
  };

  const handleRejectOrder = async (orderId) => {
    setLoadingStates(prev => ({ ...prev, rejectOrder: true }));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: 'Rejected' })
      });
      
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(order => 
          order._id === orderId ? updatedOrder : order
        ));
        showToast('Order rejected successfully');
      } else {
        showToast('Failed to reject order', 'error');
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      showToast('Error rejecting order', 'error');
    } finally {
      setLoadingStates(prev => ({ ...prev, rejectOrder: false }));
    }
  };

  const updateTracking = async () => {
    setLoadingStates(prev => ({ ...prev, updateTracking: true }));
    try {
      // Get the original Order Placed dates from the current order
      const orderPlacedStage = selectedOrder.tracking?.find(t => t.stage === 'Order Placed') || {
        stage: 'Order Placed',
        plannedDate: selectedOrder.createdAt,
        actualDate: selectedOrder.createdAt
      };

      // Convert dates back to ISO format for API
      const formattedTracking = trackingData.map(item => {
        if (item.stage === 'Order Placed') {
          return {
            ...orderPlacedStage,
            plannedDate: new Date(orderPlacedStage.plannedDate).toISOString(),
            actualDate: new Date(orderPlacedStage.actualDate).toISOString()
          };
        }
        return {
          ...item,
          plannedDate: item.plannedDate ? new Date(item.plannedDate + 'T00:00:00.000Z').toISOString() : null,
          actualDate: item.actualDate ? new Date(item.actualDate + 'T00:00:00.000Z').toISOString() : null
        };
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${selectedOrder._id}/tracking`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracking: formattedTracking })
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
    } finally {
      setLoadingStates(prev => ({ ...prev, updateTracking: false }));
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setLoadingStates(prev => ({ ...prev, deleteOrder: true }));
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setOrders(prev => prev.filter(order => order._id !== orderId));
          showToast('Order deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        showToast('Error deleting order', 'error');
      } finally {
        setLoadingStates(prev => ({ ...prev, deleteOrder: false }));
      }
    }
  };

  const exportToCSV = async () => {
    setLoadingStates(prev => ({ ...prev, exportToCSV: true }));
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
    } finally {
      setLoadingStates(prev => ({ ...prev, exportToCSV: false }));
    }
  };

  const refreshOrders = () => {
    setLoadingStates(prev => ({ ...prev, refreshOrders: true }));
    fetchOrders().finally(() => {
      setLoadingStates(prev => ({ ...prev, refreshOrders: false }));
    });
  };

  const renderOrderRow = (order) => {
    const statusColors = getStatusColor(order.orderStatus);
    
    return (
      <TableRow key={order._id}>
        <TableCell>{order._id}</TableCell>
        <TableCell>{order.customerName}</TableCell>
        <TableCell>{order.businessName}</TableCell>
        <TableCell>{formatDate(order.createdAt)}</TableCell>
        {order.orderStatus === 'Pending' ? (
          <>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Accept Order">
                  <IconButton 
                    onClick={() => handleAcceptOrder(order._id)}
                    color="success"
                    size="small"
                    disabled={loadingStates.acceptOrder}
                  >
                    {loadingStates.acceptOrder ? (
                      <CircularProgress size={24} color="success" />
                    ) : (
                      <CheckCircleIcon />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject Order">
                  <IconButton 
                    onClick={() => handleRejectOrder(order._id)}
                    color="error"
                    size="small"
                    disabled={loadingStates.rejectOrder}
                  >
                    {loadingStates.rejectOrder ? (
                      <CircularProgress size={24} color="error" />
                    ) : (
                      <CancelIcon />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="View Details">
                  <IconButton 
                    onClick={() => openTrackingModal(order, true)}
                    color="primary"
                    size="small"
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
          </>
        ) : order.orderStatus === 'Accepted' ? (
          <>
            <TableCell>{formatDate(order.tracking?.[1]?.plannedDate)}</TableCell>
            <TableCell>{formatDate(order.tracking?.[1]?.actualDate)}</TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Update Tracking">
                  <IconButton 
                    onClick={() => openTrackingModal(order, false)}
                    color="primary"
                    size="small"
                    disabled={loadingStates.updateTracking}
                  >
                    {loadingStates.updateTracking ? (
                      <CircularProgress size={24} color="primary" />
                    ) : (
                      <UpdateIcon />
                    )}
                  </IconButton>
                </Tooltip>
                <Tooltip title="View Tracking">
                  <IconButton 
                    onClick={() => openTrackingModal(order, true)}
                    color="info"
                    size="small"
                  >
                    <TimelineIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
          </>
        ) : (
          <>
            <TableCell>{formatDate(order.tracking?.[1]?.plannedDate)}</TableCell>
            <TableCell>{formatDate(order.tracking?.[1]?.actualDate)}</TableCell>
            <TableCell>
              <Tooltip title="View Tracking">
                <IconButton 
                  onClick={() => openTrackingModal(order, true)}
                  color="info"
                  size="small"
                >
                  <TimelineIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          </>
        )}
        <TableCell>
          <Chip 
            label={order.orderStatus}
            sx={{ 
              backgroundColor: statusColors.bg,
              color: statusColors.text,
              fontWeight: 'bold'
            }}
          />
        </TableCell>
      </TableRow>
    );
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
              <Tab label="Accepted" />
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
                  <TableCell>Business</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell>Planned Date</TableCell>
                  <TableCell>Actual Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {filteredOrders.map((order) => renderOrderRow(order))}
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
                    <Typography variant="body1">{selectedOrder.orderPlacerName || selectedOrder.customerName || 'N/A'}</Typography>
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
                          disabled={readOnlyMode || item.stage === 'Order Placed'}
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{ 
                            '& .Mui-disabled': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              color: 'text.primary'
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          value={item.actualDate || ''}
                          onChange={(e) => handleTrackingChange(index, 'actualDate', e.target.value)}
                          disabled={readOnlyMode || item.stage === 'Order Placed'}
                          fullWidth
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{ 
                            '& .Mui-disabled': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              color: 'text.primary'
                            }
                          }}
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
                startIcon={loadingStates.updateTracking ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={loadingStates.updateTracking}
              >
                {loadingStates.updateTracking ? 'Saving...' : 'Save Changes'}
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
