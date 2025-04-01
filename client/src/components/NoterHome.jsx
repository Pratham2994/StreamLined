import React, { useState, useContext, useEffect } from 'react';
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
  CircularProgress,
  Backdrop
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function NoterHome() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastContainerKey, setToastContainerKey] = useState(0);

  // Force a re-render of ToastContainer
  useEffect(() => {
    setToastContainerKey(prev => prev + 1);
  }, []);

  // Fetch products with loading state
  useEffect(() => {
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
        toast.error("Error loading products", {
          position: "bottom-right",
          autoClose: 3000
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    const quantity = parseInt(quantities[product.itemCode]) || 1;
    if (quantity < 1) {
      toast.error('Quantity must be at least 1', {
        position: "bottom-right",
        autoClose: 3000
      });
      return;
    }

    setIsLoading(true);
    try {
      const cartResponse = await fetch(`http://localhost:3000/api/cart/${user.email}`, { 
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

      const updateResponse = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customerEmail: user.email, items })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update cart');
      }

      toast.success(`${product.productName} added to cart`, {
        position: "bottom-right",
        autoClose: 3000
      });
      setQuantities(prev => ({ ...prev, [product.itemCode]: 1 }));
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(error.message || 'Error updating cart', {
        position: "bottom-right",
        autoClose: 3000
      });
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

  const uniqueFilteredProducts = Array.from(
    new Map(filteredProducts.map(product => [product.itemCode, product])).values()
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ position: 'relative', p: 3, minHeight: '100vh', backgroundColor: 'transparent' }}>
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <ParticlesBackground />
        </Box>
        
        <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>Place Order as Noter</Typography>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <TextField
            label="Search products"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: '300px' }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(240,248,255,0.85)', borderRadius: '8px', overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item Code</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Drawing Code</TableCell>
                <TableCell>Revision</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Add to Cart</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {uniqueFilteredProducts.map(product => (
                <TableRow key={product.itemCode}>
                  <TableCell>{product.itemCode}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{product.drawingCode}</TableCell>
                  <TableCell>{product.revision}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={quantities[product.itemCode] || 1}
                      onChange={(e) => setQuantities(prev => ({ ...prev, [product.itemCode]: e.target.value }))}
                      inputProps={{ min: 1 }}
                      sx={{ width: '80px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      onClick={() => handleAddToCart(product)}
                      disabled={isLoading}
                      sx={{ textTransform: 'none' }}
                    >
                      {isLoading ? <CircularProgress size={24} /> : 'Add to Cart'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/noter/cart')}
            sx={{ textTransform: 'none' }}
          >
            Go to Cart
          </Button>
        </Box>
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

      <ToastContainer
        key={toastContainerKey}
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </motion.div>
  );
}

export default NoterHome;
