import React, { useState, useContext } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ParticlesBackground from './ParticlesBackground';

// Memoize the ParticlesBackground so it doesn't re-render unnecessarily
const MemoizedParticlesBackground = React.memo(ParticlesBackground);

const products = [
  { itemCode: '56101997DG00795', productName: 'Slimline H1 Assy PC', drawingCode: '56101997DG00795', revision: 'Rev1' },
  { itemCode: '56101905DG14847', productName: 'KREATION X2 OHU MAIN BODY 400W', drawingCode: '56101905DG14847', revision: 'Rev1' },
  { itemCode: '56101905DG15222', productName: 'KREATION X2 OHU ADDON BODY 400W', drawingCode: '56101905DG15222', revision: 'Rev1' },
  { itemCode: '56101905DG14840', productName: 'KREATION X2 OHU MAIN BODY 500W', drawingCode: '56101905DG14840', revision: 'Rev1' },
  { itemCode: '56101905DG14845', productName: 'KREATION X2 OHU ADDON BODY 800W', drawingCode: '56101905DG14845', revision: 'Rev1' },
  { itemCode: '56101905DG14839', productName: 'KREATION X2 OHU ADDON BODY 900W', drawingCode: '56101905DG14839', revision: 'Rev1' },
  { itemCode: '56101999SD21781', productName: 'Kreation Dresser Packet 1', drawingCode: '56101999SD21781', revision: 'Rev1' },
  { itemCode: '56101999SD21782', productName: 'Kreation dresser Packet 2', drawingCode: '56101999SD21782', revision: 'Rev1' },
  { itemCode: '30161803SD01056', productName: 'SLIMLINE BLEND OHU UNIT BODY- ROYAL IVORY , DOOR -TEX. PURPLE', drawingCode: '30161803SD01056', revision: 'Rev1' },
  { itemCode: '30161803SD01047', productName: '2DR SLIMLINE OHU UNIT BODY- ROYAL IVORY , DOOR - ROYAL IVORY', drawingCode: '30161803SD01047', revision: 'Rev1' },
  { itemCode: '56101999SD29519', productName: 'PKT FOR SINGLE BODY LOCKER 450W KX3', drawingCode: '56101999SD29519', revision: 'Rev1' },
  { itemCode: '56101999SD29517', productName: 'PKT FOR DOUBLE BODY LOCKER 900W KX3', drawingCode: '56101999SD29517', revision: 'Rev1' },
  { itemCode: '56101999SD31220', productName: 'PKT FOR ADDON BODY OHU 900W X 900H KREATION X3', drawingCode: '56101999SD31220', revision: 'Rev1' },
  { itemCode: '56101999SD31221', productName: 'PKT FOR ADDON BODY OHU 1200W X 900H KREATION X3', drawingCode: '56101999SD31221', revision: 'Rev1' },
  { itemCode: 'dummy', productName: 'KD STW PLAIN 4SH PRINCE GEY', drawingCode: 'dummy', revision: 'Rev1' },
  { itemCode: 'dummy', productName: 'KD STW PLAIN 4SH  CLOUD GREY', drawingCode: 'dummy', revision: 'Rev1' },
  { itemCode: 'dummy', productName: 'KD STW PLAIN 4SH  TEX BOND WHITE', drawingCode: 'dummy', revision: 'Rev1' },
  { itemCode: 'dummy', productName: 'KD STW MINOR WITH TOP PANEL PRINCE GREY', drawingCode: 'dummy', revision: 'Rev1' },
  { itemCode: '31162814SD00470', productName: 'M2 Snap Fit Rationalised Set', drawingCode: '31162814SD00470', revision: 'Rev1' },
  { itemCode: '56101905DG06172', productName: 'RH/LH DOOR COVER FOR LOCKER', drawingCode: '56101905DG06172', revision: 'Rev1' },
  { itemCode: '56101905DG11140', productName: 'Offset Strip 790mm For snapfit', drawingCode: '56101905DG11140', revision: 'Rev1' },
  { itemCode: '56101905DG03918', productName: 'SUPPORT ANGLE FOR BOTTOM SHELF', drawingCode: '56101905DG03918', revision: 'Rev1' },
  { itemCode: '56101905DG03978', productName: 'SECRET DOOR ASSY', drawingCode: '56101905DG03978', revision: 'Rev1' },
  { itemCode: '56101905DG03884', productName: 'SIDE PIECE', drawingCode: '56101905DG03884', revision: 'Rev1' },
  { itemCode: '56101905DG03975', productName: 'OFFSET STRIP 280', drawingCode: '56101905DG03975', revision: 'Rev1' },
  { itemCode: '56101905DG05241', productName: 'OFFSET STRIP 383', drawingCode: '56101905DG05241', revision: 'Rev1' },
  { itemCode: '56101905DG03945', productName: 'BACK CHANNEL', drawingCode: '56101905DG03945', revision: 'Rev1' },
  { itemCode: '56101905DG03960', productName: 'LOCKER SHELF LOWER With TOOL', drawingCode: '56101905DG03960', revision: 'Rev1' },
  { itemCode: '56101905DG03961', productName: 'LOCKER SHELF UPPER', drawingCode: '56101905DG03961', revision: 'Rev1' },
  { itemCode: '56101905DG03914', productName: 'Drawer Front assy For H1', drawingCode: '56101905DG03914', revision: 'Rev1' },
  { itemCode: '56101905DG04010', productName: 'Drawer Upper Shelf H1 assy', drawingCode: '56101905DG04010', revision: 'Rev1' },
  { itemCode: '56101905DG03959', productName: 'FRONT FRAME ASSY', drawingCode: '56101905DG03959', revision: 'Rev1' },
  { itemCode: '56101905DG03946', productName: 'BACK STRIP WARDROBE', drawingCode: '56101905DG03946', revision: 'Rev1' },
  { itemCode: '56101905DG06974', productName: 'RH LOCKER DOOR CENTURIAN', drawingCode: '56101905DG06974', revision: 'Rev1' },
  { itemCode: '56101905DG06165', productName: 'LH LOCKER DOOR CENTURIAN', drawingCode: '56101905DG06165', revision: 'Rev1' },
  { itemCode: '31162814SD00460', productName: 'HARDWARE PKT HANGING ROD TIE BAR = H', drawingCode: '31162814SD00460', revision: 'Rev1' },
  { itemCode: '31162814SD00461', productName: 'HARDWARE PKT HANGING ROD TIE BAR = Snapfit WR H1', drawingCode: '31162814SD00461', revision: 'Rev1' },
  { itemCode: '31162814SD00412', productName: 'HARDWARE PKT HANGING ROD TIE BAR M2 SNAP FIT', drawingCode: '31162814SD00412', revision: 'Rev1' },
  { itemCode: '31162814SD00433', productName: 'LOCK H/W PKT WR = H1', drawingCode: '31162814SD00433', revision: 'Rev1' },
  { itemCode: '31162814SD00472', productName: 'H/W PKT LOCK = M 2', drawingCode: '31162814SD00472', revision: 'Rev1' },
  { itemCode: '56101905DG01385', productName: 'Hinge Pin 110 mm', drawingCode: '56101905DG01385', revision: 'Rev1' },
  { itemCode: '56101905DG05343', productName: 'Snap Fit Hinge Pin M2 (55 MM)', drawingCode: '56101905DG05343', revision: 'Rev1' }
];

const NoterHome = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Local state for details form
  const [details, setDetails] = useState({
    customerEmail: '',
    businessName: '',
    orderPlacerName: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({
    customerEmail: '',
    businessName: '',
    orderPlacerName: '',
    phoneNumber: ''
  });
  const [detailsSubmitted, setDetailsSubmitted] = useState(false);
  
  const [quantities, setQuantities] = useState({});

  // Validate all fields on submission
  const validateDetails = () => {
    let valid = true;
    const newErrors = { customerEmail: '', businessName: '', orderPlacerName: '', phoneNumber: '' };

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

  return (
    <Box sx={{ position: 'relative', p: 3, minHeight: '100vh' }}>
      {/* Memoized Particle Background */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
        <MemoizedParticlesBackground />
      </Box>

      <Typography variant="h4" sx={{ mb: 2, textAlign: 'center' }}>Place Order as Noter</Typography>
      
      {/* Details Form arranged horizontally */}
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
          <Button variant="contained" sx={{ textTransform: 'none' }} onClick={handleDetailsSubmit}>
            Submit Details
          </Button>
        </Box>
      )}

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(240,248,255,0.85)', borderRadius: '8px' }}>
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
            {products.map(product => (
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
                    onChange={(e) => handleQuantityChange(product.itemCode, e.target.value)}
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
