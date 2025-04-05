import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Backdrop,
  InputAdornment,
  Tooltip,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ParticlesBackground from './ParticlesBackground';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CategoryIcon from '@mui/icons-material/Category';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import Papa from 'papaparse';
import axiosInstance from '../utils/axios';

// -------------------------
// Memoized ProductRow Component
// -------------------------
const ProductRow = React.memo(({ product, index, onProductChange, onDelete }) => {
  return (
    <TableRow
      key={product._id || `${product.itemCode}-${index}`}
      sx={{
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          transition: 'background-color 0.2s ease'
        }
      }}
    >
      <TableCell>
        <TextField
          value={product.itemCode}
          onChange={(e) => onProductChange(index, 'itemCode', e.target.value)}
          size="small"
          variant="outlined"
          sx={{ minWidth: '150px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CodeIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
          autoComplete="off"
        />
      </TableCell>
      <TableCell>
        <TextField
          value={product.productName}
          onChange={(e) => onProductChange(index, 'productName', e.target.value)}
          size="small"
          variant="outlined"
          sx={{ minWidth: '200px' }}
        />
      </TableCell>
      <TableCell>
        <TextField
          value={product.drawingCode}
          onChange={(e) => onProductChange(index, 'drawingCode', e.target.value)}
          size="small"
          variant="outlined"
          sx={{ minWidth: '150px' }}
        />
      </TableCell>
      <TableCell>
        <TextField
          value={product.revision}
          onChange={(e) => onProductChange(index, 'revision', e.target.value)}
          size="small"
          variant="outlined"
          sx={{ minWidth: '100px' }}
        />
      </TableCell>
      <TableCell>
        <TextField
          type="number"
          value={product.minimumOrderQuantity ?? ''}
          onChange={(e) => onProductChange(index, 'minimumOrderQuantity', e.target.value)}
          size="small"
          variant="outlined"
          sx={{ minWidth: '100px' }}
          inputProps={{ min: 1 }}
          onBlur={(e) => {
            const value = parseInt(e.target.value) || 1;
            onProductChange(index, 'minimumOrderQuantity', Math.max(1, value));
          }}
        />
      </TableCell>
      <TableCell>
        <Tooltip title="Delete Product">
          <IconButton onClick={() => onDelete(index)} color="error" size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the product data for this row has changed
  return prevProps.product === nextProps.product;
});

// -------------------------
// Main Config Component
// -------------------------
function Config() {
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);
  const toastIdRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();

    // Set mounted state after a delay to ensure ToastContainer is fully initialized
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, []);

  const showToast = (message, type = 'success') => {
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
    toast.dismiss();
    setTimeout(() => {
      if (type === 'success') {
        toastIdRef.current = toast.success(message, toastOptions);
      } else {
        toastIdRef.current = toast.error(message, toastOptions);
      }
    }, 300);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/api/products');
      setProductList(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error loading products: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Wrap callbacks with useCallback to keep their references stable.
  const handleProductChange = useCallback((index, field, value) => {
    setProductList((prev) => {
      const updated = [...prev];
      // Only update the changed product row:
      updated[index] = {
        ...updated[index],
        [field]:
          field === 'minimumOrderQuantity'
            ? value === '' ? '' : parseInt(value)
            : value
      };
      return updated;
    });
  }, []);

  const handleDeleteProduct = useCallback((index) => {
    setProductList((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const handleSaveProducts = async () => {
    const validatedProducts = productList.map(product => ({
      ...product,
      minimumOrderQuantity: Math.max(1, parseInt(product.minimumOrderQuantity) || 1)
    }));

    setIsLoading(true);
    try {
      await axiosInstance.put('/api/products', { products: validatedProducts });
      await fetchProducts();
      showToast('Products updated successfully');
    } catch (error) {
      console.error('Error saving products:', error);
      if (error.response?.status === 429) {
        showToast('Rate limit exceeded. Please wait a moment before trying again.', 'error');
      } else {
        showToast(`Failed to update products: ${error.response?.data?.message || error.message}`, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setProductList(prev => ([
      {
        itemCode: '',
        productName: '',
        drawingCode: '',
        revision: '',
        minimumOrderQuantity: 1
      },
      ...prev
    ]));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: async (results) => {
          if (results.data && results.data.length > 0) {
            try {
              const headers = results.data[0];
              const requiredColumns = ['itemCode', 'productName'];
              const hasRequiredColumns = requiredColumns.every(col =>
                headers.includes(col)
              );
              if (!hasRequiredColumns) {
                showToast('CSV must include itemCode, productName columns', 'error');
                return;
              }
              const products = results.data.slice(1)
                .filter(row => row.length === headers.length && row.some(cell => cell))
                .map(row => {
                  const product = {
                    itemCode: '',
                    productName: '',
                    drawingCode: '',
                    revision: '',
                    minimumOrderQuantity: 1
                  };
                  headers.forEach((header, index) => {
                    if (header === 'minimumOrderQuantity') {
                      const value = parseInt(row[index]);
                      product[header] = Math.max(1, value || 1);
                    } else {
                      product[header] = row[index] || '';
                    }
                  });
                  return product;
                });
              if (products.length === 0) {
                showToast('No valid products found in CSV', 'error');
                return;
              }
              setIsLoading(true);
              await axiosInstance.put('/api/products', { products });
              await fetchProducts();
              showToast('Products imported successfully');
            } catch (error) {
              console.error('Error importing products:', error);
              showToast(`Failed to import products: ${error.response?.data?.message || error.message}`, 'error');
            } finally {
              setIsLoading(false);
              event.target.value = '';
            }
          }
        },
        header: true,
        skipEmptyLines: true,
        error: (error) => {
          console.error('CSV parsing error:', error);
          showToast('Error parsing CSV file', 'error');
        }
      });
    }
  };

  const handleMakeAdmin = async () => {
    if (!adminEmail) {
      showToast('Please enter an email address', 'error');
      return;
    }

    setIsUpdatingAdmin(true);
    try {
      await axiosInstance.put('/api/users/update-role', {
        email: adminEmail,
        newRole: 'admin'
      });
      showToast('User role updated to admin successfully');
      setAdminModalOpen(false);
      setAdminEmail('');
    } catch (error) {
      console.error('Error updating user role:', error);
      showToast(`Failed to update user role: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsUpdatingAdmin(false);
    }
  };

  // Filter products by search term
  const filteredProducts = searchTerm
    ? productList.filter(product =>
        product.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.drawingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.revision.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : productList;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        if (!isMounted) {
          setIsMounted(true);
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
            width: '100%', 
            mb: 2, 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              p: 3, 
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
              backgroundColor: 'primary.main',
              color: 'white'
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' }
              }}
            >
              Product Management
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: { xs: 2, sm: 0 },
              mb: 3
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}>
                <CategoryIcon color="primary" />
                Product Management
              </Typography>

              <TextField
                placeholder="Search products..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ 
                  width: { xs: '100%', sm: 300 }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Manage all products that can be ordered through the system. Make sure to include accurate item and drawing codes.
            </Alert>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'flex-start', 
              gap: 1, 
              mb: 3
            }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                flexDirection: { xs: 'column', sm: 'row' },
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddProduct}
                  disabled={isLoading}
                  sx={{ 
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Add Product
                </Button>
                
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={isLoading}
                  sx={{ 
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Import CSV
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={handleFileUpload}
                  />
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchProducts}
                  disabled={isLoading}
                  sx={{ 
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Refresh Products
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<AdminPanelSettingsIcon />}
                  onClick={() => setAdminModalOpen(true)}
                  disabled={isLoading}
                  sx={{ 
                    textTransform: 'none',
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Make Admin
                </Button>
              </Box>
              
              <Button
                variant="contained"
                color="success"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveProducts}
                disabled={isLoading || productList.length === 0}
                sx={{ 
                  textTransform: 'none',
                  ml: { sm: 'auto' },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                {isLoading ? 'Saving...' : 'Save All Products'}
              </Button>
            </Box>
            
            {productList.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6">No products added yet</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Add products using the buttons above
                </Typography>
              </Box>
            ) : filteredProducts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6">No matching products found</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your search criteria
                </Typography>
              </Box>
            ) : (
              <TableContainer 
                sx={{ 
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  mb: 3,
                  overflowX: 'auto',
                  '.MuiTable-root': {
                    minWidth: { xs: 800, md: '100%' }  // Force minimum width on mobile
                  },
                  '.MuiTableCell-root': {
                    padding: { xs: '8px', sm: '16px' },
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  },
                  '.MuiTableCell-head': {
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  },
                  '.MuiTextField-root': {
                    minWidth: { xs: '120px', sm: '150px' }
                  },
                  '.MuiIconButton-root': {
                    padding: { xs: '4px', sm: '8px' }
                  }
                }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Item Code</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Drawing Code</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Revision</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Min. Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map((product, index) => (
                      <ProductRow
                        key={product._id || `${product.itemCode}-${index}`}
                        product={product}
                        index={index}
                        onProductChange={handleProductChange}
                        onDelete={handleDeleteProduct}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      </Box>

      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 2
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Dialog
        open={adminModalOpen}
        onClose={() => !isUpdatingAdmin && setAdminModalOpen(false)}
        maxWidth="xs"
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
          alignItems: 'center',
          gap: 1,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          pb: 1
        }}>
          <AdminPanelSettingsIcon color="primary" />
          <Typography variant="h6">Make User Admin</Typography>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="User Email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            type="email"
            disabled={isUpdatingAdmin}
            size="small"
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <Button
            onClick={() => setAdminModalOpen(false)}
            variant="outlined"
            disabled={isUpdatingAdmin}
            startIcon={<CloseIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMakeAdmin}
            variant="contained"
            color="primary"
            disabled={isUpdatingAdmin}
            startIcon={isUpdatingAdmin ? <CircularProgress size={20} color="inherit" /> : <AdminPanelSettingsIcon />}
          >
            {isUpdatingAdmin ? 'Updating...' : 'Make Admin'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default Config;
