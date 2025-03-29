import React, { useState, useContext, useEffect } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

const CustomerHome = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  const [quantities, setQuantities] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);

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

  const addToCart = async (product) => {
    try {
      const response = await fetch('http://localhost:3000/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          productId: product._id, 
          quantity: quantities[product.itemCode] || 1 
        })
      });
      
      if (response.ok) {
        toast.success(`${product.productName} added to cart`);
        setQuantities({}); // Reset quantities after successful add
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error adding to cart');
    }
  };

  // Add responsive styles
  const responsiveStyles = {
    container: {
      position: 'relative',
      p: { xs: 1, sm: 2, md: 3 },
      minHeight: '100vh',
      backgroundColor: 'transparent'
    },
    title: {
      mb: { xs: 1, sm: 2 },
      textAlign: 'center',
      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
    },
    searchContainer: {
      mb: { xs: 1, sm: 2 },
      display: 'flex',
      justifyContent: 'center',
      px: { xs: 1, sm: 2 }
    },
    searchField: {
      width: { xs: '100%', sm: '300px' },
      maxWidth: '300px'
    },
    tableContainer: {
      backgroundColor: 'rgba(240,248,255,0.85)',
      borderRadius: '8px',
      overflowX: 'auto',
      mx: { xs: 1, sm: 2 }
    },
    table: {
      minWidth: { xs: 800, sm: 1000 },
      '& .MuiTableCell-root': {
        px: { xs: 1, sm: 2 },
        py: { xs: 1, sm: 1.5 }
      }
    },
    quantityField: {
      width: { xs: '60px', sm: '80px' }
    },
    addButton: {
      textTransform: 'none',
      minWidth: { xs: '60px', sm: '80px' }
    }
  };

  // Initialize Toastify with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      // Force a re-render of ToastContainer
      const event = new Event('resize');
      window.dispatchEvent(event);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={responsiveStyles.container}>
        <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
          <ParticlesBackground />
        </Box>
        <Typography variant="h4" sx={responsiveStyles.title}>Products</Typography>
        <Box sx={responsiveStyles.searchContainer}>
          <TextField
            label="Search products"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={responsiveStyles.searchField}
          />
        </Box>
        <TableContainer
          component={Paper}
          sx={responsiveStyles.tableContainer}
        >
          <Table sx={responsiveStyles.table}>
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
                      value={quantities[product.itemCode] === undefined ? 1 : quantities[product.itemCode]}
                      onChange={(e) => setQuantities(prev => ({ ...prev, [product.itemCode]: e.target.value }))}
                      inputProps={{ min: 1 }}
                      sx={responsiveStyles.quantityField}
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      onClick={() => addToCart(product)}
                      sx={responsiveStyles.addButton}
                    >
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </motion.div>
  );
};

export default CustomerHome;
