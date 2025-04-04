import React, { useState, useContext, useEffect, useRef } from 'react';
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
  TextField, 
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Backdrop,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axiosInstance from '../utils/axios';

const CustomerHome = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingItems, setProcessingItems] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const toastQueue = useRef([]);
  const animationCompleted = useRef(false);
  const isToastReady = useRef(false);

  // Function to process any pending toasts
  const processPendingToasts = () => {
    if (isMounted && isToastReady.current && toastQueue.current.length > 0) {
      // Process all queued toasts
      toastQueue.current.forEach(({ message, type }) => {
        // Force clear any existing toasts
        toast.dismiss();
        
        // Directly call toast API with specific options
        if (type === 'success') {
          toast.success(message, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light"
          });
        } else if (type === 'error') {
          toast.error(message, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light"
          });
        } else {
          toast.info(message, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light"
          });
        }
      });
      
      // Clear the queue
      toastQueue.current = [];
    }
  };

  // Improved showToast function
  const showToast = (message, type = 'success') => {
    // If toast system not ready, queue the toast for later
    if (!isMounted || !isToastReady.current) {
      toastQueue.current.push({ message, type });
      return;
    }
    
    // Component is mounted, directly show the toast
    // Force clear any existing toasts
    toast.dismiss();
    
    // Add a slight delay before showing the toast
    setTimeout(() => {
      if (type === 'success') {
        toast.success(message, {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light"
        });
      } else if (type === 'error') {
        toast.error(message, {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light"
        });
      } else {
        toast.info(message, {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light"
        });
      }
    }, 100);
  };

  useEffect(() => {
    fetchProducts();
    
    // Create a dedicated function for initializing the toast system
    const initializeToastSystem = () => {
      setIsMounted(true);
      
      // Force a layout recalculation
      window.dispatchEvent(new Event('resize'));
      
      // Mark toast system as ready with a delay to ensure DOM is updated
      setTimeout(() => {
        isToastReady.current = true;
        processPendingToasts();
      }, 1000);
    };
    
    // Initialize toast system with a delay to ensure component is mounted
    setTimeout(initializeToastSystem, 500);
    
    // Set up periodic resize events to ensure toast container is initialized
    const resizeTimer = setInterval(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
    
    // Clean up timers after 5 seconds
    setTimeout(() => {
      clearInterval(resizeTimer);
    }, 5000);
    
    return () => {
      clearInterval(resizeTimer);
      // Explicitly dismiss all toasts when unmounting
      toast.dismiss();
    };
  }, []);

  // Process pending toasts whenever toast system readiness changes
  useEffect(() => {
    if (isMounted && isToastReady.current) {
      processPendingToasts();
    }
  }, [isMounted]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Error loading products. Please try again later.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = searchTerm
    ? products.filter(product =>
        product.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.drawingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.revision.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const uniqueFilteredProducts = (() => {
    const map = new Map();
    filteredProducts.forEach(product => {
      if (!map.has(product.itemCode)) {
        map.set(product.itemCode, product);
      }
    });
    return Array.from(map.values());
  })();

  const handleQuantityChange = (itemCode, value) => {
    const product = products.find(p => p.itemCode === itemCode);
    const minQuantity = product?.minimumOrderQuantity || 1;
    setQuantities(prev => ({ 
      ...prev, 
      [itemCode]: Math.max(minQuantity, parseInt(value) || minQuantity) 
    }));
  };

  const incrementQuantity = (itemCode) => {
    setQuantities(prev => ({ 
      ...prev, 
      [itemCode]: (prev[itemCode] || getMinQuantity(itemCode)) + 1 
    }));
  };

  const decrementQuantity = (itemCode) => {
    const minQuantity = getMinQuantity(itemCode);
    setQuantities(prev => ({ 
      ...prev, 
      [itemCode]: Math.max(minQuantity, (prev[itemCode] || minQuantity) - 1) 
    }));
  };

  const getMinQuantity = (itemCode) => {
    const product = products.find(p => p.itemCode === itemCode);
    return product?.minimumOrderQuantity || 1;
  };

  const addToCart = async (product) => {
    setProcessingItems(prev => [...prev, product.itemCode]);
    
    try {
      const minQuantity = product.minimumOrderQuantity || 1;
      const quantity = quantities[product.itemCode] || minQuantity;
      
      // Get current cart first
      const cartResponse = await axiosInstance.get(`/api/cart/${user.email}`);
      const items = cartResponse.data.items || [];
      
      // Check if item already exists in cart
      const existingItemIndex = items.findIndex(item => item.itemCode === product.itemCode);
      if (existingItemIndex !== -1) {
        items[existingItemIndex].quantity = Math.max(minQuantity, items[existingItemIndex].quantity + quantity);
        items[existingItemIndex].minimumOrderQuantity = minQuantity;
      } else {
        items.push({ 
          ...product, 
          quantity: Math.max(minQuantity, quantity),
          minimumOrderQuantity: minQuantity 
        });
      }

      // Update cart
      await axiosInstance.post('/api/cart', {
        customerEmail: user.email,
        items
      });

      // Force layout recalculation before showing toast
      window.dispatchEvent(new Event('resize'));
      
      // Make sure the toast system is ready before proceeding
      if (!isToastReady.current) {
        isToastReady.current = true;
        setIsMounted(true);
      }
      
      // Add a small delay before showing toast
      setTimeout(() => {
        showToast(`${product.productName} added to cart`);
      }, 200);
      
      // Reset quantity for this item
      setQuantities(prev => ({ ...prev, [product.itemCode]: 1 }));
    } catch (error) {
      // Add a small delay before showing toast
      setTimeout(() => {
        showToast(`Failed to add item: ${error.response?.data?.message || 'Unknown error'}`, 'error');
      }, 200);
    } finally {
      // Remove from processing items
      setProcessingItems(prev => prev.filter(id => id !== product.itemCode));
    }
  };

  // Add responsive styles
  const styles = {
    container: {
      position: 'relative',
      p: { xs: 1, sm: 2, md: 4 },
      minHeight: '100vh'
    },
    searchContainer: {
      display: 'flex',
      justifyContent: 'center',
      mb: 3,
      width: '100%'
    },
    searchField: {
      width: { xs: '100%', sm: '400px' }
    },
    productCard: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        boxShadow: 6,
        transform: 'translateY(-4px)'
      }
    },
    productTitle: {
      mb: 1,
      fontWeight: 'bold',
      height: { xs: '2.5em', sm: '3em' },
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      fontSize: { xs: '0.9rem', sm: '1rem' }
    },
    productDetails: {
      mt: 2,
      '& > *': {
        mb: 1,
        fontSize: { xs: '0.8rem', sm: '0.875rem' }
      }
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
      gap: { xs: 0.5, sm: 1 }
    },
    quantityField: {
      width: { xs: '50px', sm: '60px' },
      mx: { xs: 0.5, sm: 1 }
    },
    addToCartButton: {
      textTransform: 'none',
      whiteSpace: 'nowrap',
      minWidth: { xs: '100px', sm: '120px' }
    }
  };

  // Render product cards with responsive grid
  const renderProductCards = () => (
    <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mt: 1 }}>
      {uniqueFilteredProducts.map(product => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.itemCode}>
          <Card elevation={3} sx={styles.productCard}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" sx={styles.productTitle}>
                {product.productName}
              </Typography>
              
              <Box sx={styles.productDetails}>
                <Typography variant="body2">
                  <strong>Item Code:</strong> {product.itemCode}
                </Typography>
                <Typography variant="body2">
                  <strong>Revision:</strong> {product.revision}
                </Typography>
                <Typography variant="body2">
                  <strong>Drawing Code:</strong> {product.drawingCode}
                </Typography>
              </Box>
            </CardContent>
            
            <Divider />
            
            <CardActions sx={{ 
              p: { xs: 1, sm: 2 }, 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1, sm: 0 },
              justifyContent: 'space-between'
            }}>
              <Box sx={styles.quantityControls}>
                <IconButton 
                  size="small" 
                  onClick={() => decrementQuantity(product.itemCode)}
                  disabled={processingItems.includes(product.itemCode)}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <TextField
                  type="number"
                  size="small"
                  value={quantities[product.itemCode] || product.minimumOrderQuantity || 1}
                  onChange={(e) => handleQuantityChange(product.itemCode, e.target.value)}
                  inputProps={{ 
                    min: product.minimumOrderQuantity || 1, 
                    style: { textAlign: 'center' } 
                  }}
                  sx={styles.quantityField}
                  disabled={processingItems.includes(product.itemCode)}
                />
                <IconButton 
                  size="small" 
                  onClick={() => incrementQuantity(product.itemCode)}
                  disabled={processingItems.includes(product.itemCode)}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Tooltip title="Add to Cart">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={processingItems.includes(product.itemCode) ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
                  onClick={() => addToCart(product)}
                  disabled={processingItems.includes(product.itemCode)}
                  fullWidth={isSmallScreen}
                  sx={styles.addToCartButton}
                >
                  {processingItems.includes(product.itemCode) ? 'Adding...' : 'Add to Cart'}
                </Button>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        animationCompleted.current = true;
        setIsMounted(true);
        window.dispatchEvent(new Event('resize'));
        processPendingToasts();
      }}
    >
      <Box sx={styles.container}>
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          zIndex: -1 
        }}>
          <ParticlesBackground />
        </Box>
        
        <Backdrop
          sx={{ 
            color: '#fff', 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            flexDirection: 'column'
          }}
          open={isLoading}
        >
          <CircularProgress color="inherit" size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3, color: 'white' }}>
            Loading Products...
          </Typography>
        </Backdrop>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
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
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >
            Available Products
          </Typography>
          
          <Box sx={styles.searchContainer}>
            <TextField
              label="Search products"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={styles.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          
          {uniqueFilteredProducts.length === 0 && !isLoading ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6">No products found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {searchTerm ? 'Try adjusting your search criteria' : 'No products are currently available'}
              </Typography>
            </Box>
          ) : (
            renderProductCards()
          )}
        </Paper>
        
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
      </Box>
    </motion.div>
  );
};

export default CustomerHome;
