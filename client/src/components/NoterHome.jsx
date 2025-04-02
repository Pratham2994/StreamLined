import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Backdrop,
  Grid,
  Card,
  CardContent,
  CardActions,
  InputAdornment,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

function NoterHome() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingItems, setProcessingItems] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const toastQueue = useRef([]);
  const toastContainerRef = useRef(null);
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
      const response = await fetch("http://localhost:3000/api/products");
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Error loading products. Please try again later.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (itemCode, value) => {
    setQuantities(prev => ({ 
      ...prev, 
      [itemCode]: Math.max(1, parseInt(value) || 1) 
    }));
  };

  const incrementQuantity = (itemCode) => {
    setQuantities(prev => ({ 
      ...prev, 
      [itemCode]: (prev[itemCode] || 1) + 1 
    }));
  };

  const decrementQuantity = (itemCode) => {
    setQuantities(prev => ({ 
      ...prev, 
      [itemCode]: Math.max(1, (prev[itemCode] || 1) - 1) 
    }));
  };

  const handleAddToCart = async (product) => {
    // Add to processing items
    setProcessingItems(prev => [...prev, product.itemCode]);
    
    try {
      const quantity = quantities[product.itemCode] || 1;
      
      // Get current cart first
      const cartResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/${user.email}`, { 
        credentials: 'include' 
      });
      
      if (!cartResponse.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const cartData = await cartResponse.json();
      const items = cartData.items || [];
      
      const existingItemIndex = items.findIndex(item => item.itemCode === product.itemCode);
      if (existingItemIndex !== -1) {
        items[existingItemIndex].quantity += quantity;
      } else {
        items.push({ ...product, quantity });
      }

      const updateResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customerEmail: user.email, items })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update cart');
      }

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
        showToast(`Failed to add item: ${error.message || 'Unknown error'}`, 'error');
      }, 200);
    } finally {
      // Remove from processing items
      setProcessingItems(prev => prev.filter(id => id !== product.itemCode));
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

  const uniqueFilteredProducts = Array.from(
    new Map(filteredProducts.map(product => [product.itemCode, product])).values()
  );

  // Card view for products
  const renderProductCards = () => (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {uniqueFilteredProducts.map(product => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={product.itemCode}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 'bold', 
                  height: '3em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}
              >
                {product.productName}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Item Code:</strong> {product.itemCode}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Revision:</strong> {product.revision}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Drawing Code:</strong> {product.drawingCode}
                </Typography>
              </Box>
            </CardContent>
            
            <Divider />
            
            <CardActions sx={{ p: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                  value={quantities[product.itemCode] || 1}
                  onChange={(e) => handleQuantityChange(product.itemCode, e.target.value)}
                  inputProps={{ 
                    min: 1, 
                    style: { textAlign: 'center' } 
                  }}
                  sx={{ width: '60px', mx: 1 }}
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
                  onClick={() => handleAddToCart(product)}
                  disabled={processingItems.includes(product.itemCode)}
                  sx={{ 
                    textTransform: 'none',
                    whiteSpace: 'nowrap'
                  }}
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
        // Mark animation as complete
        animationCompleted.current = true;
        
        // Ensure toast system is initialized
        setIsMounted(true);
        
        // Force a layout recalculation
        window.dispatchEvent(new Event('resize'));
        
        // Mark toast system as ready with a delay
        setTimeout(() => {
          isToastReady.current = true;
          processPendingToasts();
        }, 500);
      }}
    >
      <Box sx={{ 
        position: 'relative', 
        p: { xs: 2, md: 4 }, 
        minHeight: '100vh' 
      }}>
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
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
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            Place Order as Noter
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            mb: 3 
          }}>
            <TextField
              label="Search products"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: '100%', sm: '400px' } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2, textTransform: 'none' }}
              onClick={() => navigate('/noter/cart')}
              startIcon={<ShoppingCartIcon />}
            >
              View Cart
            </Button>
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
          ref={toastContainerRef}
        />
      </Box>
    </motion.div>
  );
}

export default NoterHome;
