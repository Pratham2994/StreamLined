import React, { useState, useContext, useEffect, memo } from 'react';
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
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';

// Background container style
const fixedBoxStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: -1
};

// Memoized background particles
const BackgroundParticles = memo(() => (
  <Box sx={fixedBoxStyle}>
    <ParticlesBackground />
  </Box>
));

const NoterHome = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // State for the details form
  const [details, setDetails] = useState({
    customerEmail: '',
    businessName: '',
    orderPlacerName: '',
    phoneNumber: '',
    expectedDeliveryDate: ''
  });
  const [errors, setErrors] = useState({
    customerEmail: '',
    businessName: '',
    orderPlacerName: '',
    phoneNumber: '',
    expectedDeliveryDate: ''
  });
  const [detailsSubmitted, setDetailsSubmitted] = useState(false);

  // States for search and quantities
  const [searchTerm, setSearchTerm] = useState('');
  const [quantities, setQuantities] = useState({});

  // New state for products fetched from the DB
  const [products, setProducts] = useState([]);

  // Fetch products from the backend when component mounts
  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
  }, []);

  // Validate details form inputs
  const validateDetails = () => {
    let valid = true;
    const newErrors = {
      customerEmail: '',
      businessName: '',
      orderPlacerName: '',
      phoneNumber: '',
      expectedDeliveryDate: ''
    };
    if (!/\S+@\S+\.\S+/.test(details.customerEmail)) {
      newErrors.customerEmail = 'Invalid email format';
      valid = false;
    }
    if (!details.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
      valid = false;
    }
    if (!details.orderPlacerName.trim()) {
      newErrors.orderPlacerName = 'Order placer name is required';
      valid = false;
    }
    if (!/^\d{10}$/.test(details.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
      valid = false;
    }
    if (!details.expectedDeliveryDate.trim()) {
      newErrors.expectedDeliveryDate = 'Expected delivery date is required';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailsSubmit = () => {
    if (validateDetails()) {
      localStorage.setItem('noterCustomerEmail', details.customerEmail);
      localStorage.setItem('noterBusinessName', details.businessName);
      localStorage.setItem('noterOrderPlacerName', details.orderPlacerName);
      localStorage.setItem('noterPhoneNumber', details.phoneNumber);
      localStorage.setItem('noterExpectedDeliveryDate', details.expectedDeliveryDate);
      setDetailsSubmitted(true);
      alert('Details submitted successfully.');
    } else {
      alert('Please correct the errors before submitting.');
    }
  };

  const handleQuantityChange = (itemCode, value) => {
    setQuantities(prev => ({ ...prev, [itemCode]: value }));
  };

  const handleAddToCart = async (product) => {
    if (!detailsSubmitted) {
      alert("Please submit your details before adding items to cart.");
      return;
    }
    const quantity = parseInt(quantities[product.itemCode]) || 1;
    try {
      const res = await fetch(`http://localhost:3000/api/cart/${details.customerEmail}`, { credentials: 'include' });
      let cartData = await res.json();
      if (!cartData.items) {
        cartData.items = [];
      }
      const index = cartData.items.findIndex(item => item.itemCode === product.itemCode);
      if (index !== -1) {
        cartData.items[index].quantity += quantity;
      } else {
        cartData.items.push({ ...product, quantity });
      }
      const updateRes = await fetch('http://localhost:3000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customerEmail: details.customerEmail, items: cartData.items })
      });
      if (updateRes.ok) {
        alert(`${product.productName} added to cart.`);
      } else {
        alert('Failed to update cart.');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      alert('Error updating cart.');
    }
  };

  // Filter products based on search term
  const filteredProducts = searchTerm
    ? products.filter(product =>
        product.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.drawingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.revision.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  // Remove duplicate products based on itemCode (if any)
  const uniqueFilteredProducts = (() => {
    const map = new Map();
    filteredProducts.forEach(product => {
      if (!map.has(product.itemCode)) {
        map.set(product.itemCode, product);
      }
    });
    return Array.from(map.values());
  })();

  return (
    <Box sx={{ position: 'relative', p: 3, minHeight: '100vh', backgroundColor: 'transparent' }}>
      <BackgroundParticles />
      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>Place Order as Noter</Typography>

      {/* Details Form */}
      {!detailsSubmitted && (
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          <TextField
            label="Customer Email"
            type="email"
            name="customerEmail"
            value={details.customerEmail}
            onChange={handleDetailsChange}
            sx={{ width: '250px' }}
            error={Boolean(errors.customerEmail)}
            helperText={errors.customerEmail}
          />
          <TextField
            label="Business Name"
            type="text"
            name="businessName"
            value={details.businessName}
            onChange={handleDetailsChange}
            sx={{ width: '250px' }}
            error={Boolean(errors.businessName)}
            helperText={errors.businessName}
          />
          <TextField
            label="Order Placer Name"
            type="text"
            name="orderPlacerName"
            value={details.orderPlacerName}
            onChange={handleDetailsChange}
            sx={{ width: '250px' }}
            error={Boolean(errors.orderPlacerName)}
            helperText={errors.orderPlacerName}
          />
          <TextField
            label="Phone Number"
            type="tel"
            name="phoneNumber"
            value={details.phoneNumber}
            onChange={handleDetailsChange}
            sx={{ width: '250px' }}
            error={Boolean(errors.phoneNumber)}
            helperText={errors.phoneNumber}
          />
          <TextField
            label="Expected Delivery Date"
            type="date"
            name="expectedDeliveryDate"
            value={details.expectedDeliveryDate}
            onChange={handleDetailsChange}
            sx={{ width: '250px' }}
            error={Boolean(errors.expectedDeliveryDate)}
            helperText={errors.expectedDeliveryDate}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" sx={{ textTransform: 'none' }} onClick={handleDetailsSubmit}>
            Submit Details
          </Button>
        </Box>
      )}

      {/* Search Bar */}
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

      {/* Product Table */}
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
                    value={quantities[product.itemCode] === undefined ? 1 : quantities[product.itemCode]}
                    onChange={(e) => setQuantities(prev => ({ ...prev, [product.itemCode]: e.target.value }))}
                    inputProps={{ min: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="contained" sx={{ textTransform: 'none' }} onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Go to Cart Button */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={() => {
            if (!detailsSubmitted) {
              alert("Please submit your details before proceeding to cart.");
            } else {
              navigate('/noter/cart');
            }
          }}
          sx={{ textTransform: 'none' }}
        >
          Go to Cart
        </Button>
      </Box>
    </Box>
  );
};

export default NoterHome;
