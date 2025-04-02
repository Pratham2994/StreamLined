import React, { useState, useEffect, useRef } from 'react';
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
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ParticlesBackground from './ParticlesBackground';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CategoryIcon from '@mui/icons-material/Category';
import CodeIcon from '@mui/icons-material/Code';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import Papa from 'papaparse';

function Config() {
  const [productList, setProductList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const toastIdRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize toast system with proper mounting
  useEffect(() => {
    fetchProducts();
    
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

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/products');
      const data = await res.json();
      setProductList(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error loading products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductChange = (index, field, value) => {
    const updated = productList.map((prod, i) => {
      if (i === index) {
        return { ...prod, [field]: value };
      }
      return prod;
    });
    setProductList(updated);
  };

  const handleSaveProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ products: productList })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchProducts();
        showToast('Products updated successfully');
      } else if (response.status === 429) {
        showToast('Rate limit exceeded. Please wait a moment before trying again.', 'error');
      } else {
        showToast(`Failed to update products: ${data.message || 'Unknown error occurred'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving products:', error);
      showToast(`Error saving products: ${error.message || 'Network error occurred'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setProductList([
      { 
        itemCode: '', 
        productName: '', 
        drawingCode: '', 
        revision: '' 
      },
      ...productList
    ]);
  };

  const handleDeleteProduct = (index) => {
    const updated = [...productList];
    updated.splice(index, 1);
    setProductList(updated);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      showToast('Please upload a CSV file', 'error');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          showToast('Error parsing CSV file', 'error');
          return;
        }

        const validProducts = results.data.filter(product => 
          product.itemCode && 
          product.productName
        ).map(product => ({
          itemCode: product.itemCode,
          productName: product.productName,
          drawingCode: product.drawingCode || '',
          revision: product.revision || ''
        }));

        if (validProducts.length === 0) {
          showToast('No valid products found in CSV', 'error');
          return;
        }

        setProductList([...productList, ...validProducts]);
        showToast(`${validProducts.length} products imported successfully`);
      },
      error: (error) => {
        showToast(`Error reading CSV file: ${error.message}`, 'error');
      }
    });

    // Reset file input
    event.target.value = '';
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
        // Set mounted to true once initial animation completes
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
                textAlign: 'center'
              }}
            >
              Product Management
            </Typography>
          </Box>

      <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon color="primary" />
                Product Management
        </Typography>

              <TextField
                placeholder="Search products..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            <Alert 
              severity="info" 
              sx={{ mb: 2 }}
            >
              Manage all products that can be ordered through the system. Make sure to include accurate item and drawing codes.
            </Alert>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-start', 
              gap: 1, 
              mb: 3,
              flexWrap: 'wrap'
            }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddProduct}
                disabled={isLoading}
                sx={{ textTransform: 'none' }}
              >
                Add Product
              </Button>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={isLoading}
                sx={{ textTransform: 'none' }}
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
                sx={{ textTransform: 'none' }}
              >
                Refresh Products
              </Button>
              
              <Button
                variant="contained"
                color="success"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveProducts}
                disabled={isLoading || productList.length === 0}
                sx={{ 
                  textTransform: 'none',
                  ml: 'auto'
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
                  mb: 3
                }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: 'rgba(0, 0, 0, 0.03)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Item Code</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Drawing Code</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Revision</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProducts.map((product, index) => {
                      const productIndex = productList.findIndex(p => 
                        p.itemCode === product.itemCode && 
                        p.productName === product.productName
                      );
                      
                      return (
                        <TableRow 
                          key={`${product.itemCode}-${index}`}
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
                              onChange={(e) => handleProductChange(productIndex, 'itemCode', e.target.value)}
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
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={product.productName}
                              onChange={(e) => handleProductChange(productIndex, 'productName', e.target.value)}
                            size="small"
                              variant="outlined"
                              sx={{ minWidth: '200px' }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={product.drawingCode}
                              onChange={(e) => handleProductChange(productIndex, 'drawingCode', e.target.value)}
                            size="small"
                              variant="outlined"
                              sx={{ minWidth: '150px' }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={product.revision}
                              onChange={(e) => handleProductChange(productIndex, 'revision', e.target.value)}
                            size="small"
                              variant="outlined"
                              sx={{ minWidth: '100px' }}
                          />
                        </TableCell>
                        <TableCell>
                            <Tooltip title="Delete Product">
                              <IconButton 
                                onClick={() => handleDeleteProduct(productIndex)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                          </IconButton>
                            </Tooltip>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            </Box>
        </Paper>
      </Box>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 2
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

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
