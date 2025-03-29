// src/components/Navbar.jsx
import React, { useContext, useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link as ScrollLink } from 'react-scroll';
import logo from '../assets/logo.png';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Base nav link style
  const baseNavLinkStyle = {
    cursor: 'pointer',
    textDecoration: 'none',
    textTransform: 'none',
    color: '#666',
    fontWeight: 'normal',
    transition: 'all 0.2s ease',
    mx: 1,
    '&:hover': {
      color: '#2980b9',
      backgroundColor: 'transparent'
    }
  };

  // For links that point to actual routes
  const getActiveLinkStyle = (linkPath) => {
    const isActive = location.pathname === linkPath;
    return {
      ...baseNavLinkStyle,
      color: isActive ? '#2980b9' : '#666',
      fontWeight: isActive ? 'bold' : 'normal',
      borderBottom: isActive ? '2px solid #2980b9' : 'none'
    };
  };

  // For scroll-based public links
  const getActiveScrollLinkStyle = (sectionName) => {
    const isActive = activeSection === sectionName;
    return {
      ...baseNavLinkStyle,
      color: isActive ? '#2980b9' : '#666',
      fontWeight: isActive ? 'bold' : 'normal',
      borderBottom: isActive ? '2px solid #2980b9' : 'none'
    };
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      await fetch('http://localhost:3000/api/users/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Scroll-based navigation for non-customer
  useEffect(() => {
    if (user && (user.role === 'customer' || user.role === 'noter')) return;
    const sectionNames = ['home', 'about', 'contact'];
    const observerOptions = {
      root: null,
      rootMargin: '-70px 0px 0px 0px',
      threshold: 0.6
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const name = entry.target.getAttribute('id') || entry.target.getAttribute('name');
          if (name && sectionNames.includes(name)) {
            setActiveSection(name);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    setTimeout(() => {
      sectionNames.forEach((name) => {
        const element = document.getElementById(name) || document.querySelector(`[name="${name}"]`);
        if (element) observer.observe(element);
      });
    }, 300);

    return () => observer.disconnect();
  }, [user]);

  // Define navigation links for different user types
  const customerNavLinks = [
    { name: 'Home', to: '/customer' },
    { name: 'My Cart', to: '/customer/cart' },
    { name: 'My Orders', to: '/customer/orders' }
  ];

  const noterNavLinks = [
    { name: 'Home', to: '/noter' },
    { name: 'My Cart', to: '/noter/cart' }
  ];

  const adminNavLinks = [
    { name: 'Dashboard', to: '/admin' },
    { name: 'Config', to: '/admin/config' }
  ];

  const publicNavLinks = [
    { name: 'Home', to: 'home' },
    { name: 'About & Capabilities', to: 'about' },
    { name: 'Contact Us', to: 'contact' }
  ];

  // Toggle Drawer
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Drawer content: show different links based on user role
  const renderDrawerLinks = () => {
    if (user) {
      let links = [];
      if (user.role === 'customer') links = customerNavLinks;
      else if (user.role === 'noter') links = noterNavLinks;
      else if (user.role === 'admin') links = adminNavLinks;

      return (
        <>
          {links.map((link) => (
            <ListItem key={link.to} disablePadding>
              <ListItemButton
                onClick={() => {
                  setDrawerOpen(false);
                  navigate(link.to);
                }}
                sx={{
                  borderLeft: location.pathname === link.to ? '4px solid #2980b9' : '4px solid transparent',
                  backgroundColor: location.pathname === link.to ? 'rgba(41, 128, 185, 0.1)' : 'transparent'
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ color: location.pathname === link.to ? '#2980b9' : '#666' }}>
                      {link.name}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 1 }} />
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                setDrawerOpen(false);
                handleLogout();
              }}
              sx={{ color: '#666' }}
            >
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </>
      );
    } else {
      return (
        <>
          {publicNavLinks.map((link) => (
            <ListItem key={link.to} disablePadding>
              <ListItemButton
                onClick={() => {
                  setDrawerOpen(false);
                  // For scroll links, we need to handle them differently
                  if (link.to === 'home' || link.to === 'about' || link.to === 'contact') {
                    const element = document.getElementById(link.to);
                    if (element) {
                      // Add a small delay to ensure the drawer is closed before scrolling
                      setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setActiveSection(link.to);
                      }, 100);
                    }
                  }
                }}
                sx={{
                  borderLeft: activeSection === link.to ? '4px solid #2980b9' : '4px solid transparent',
                  backgroundColor: activeSection === link.to ? 'rgba(41, 128, 185, 0.1)' : 'transparent'
                }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ color: activeSection === link.to ? '#2980b9' : '#666' }}>
                      {link.name}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </>
      );
    }
  };

  // Add responsive styles
  const responsiveStyles = {
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      '&:hover img': {
        transform: 'scale(1.1)'
      }
    },
    logo: {
      height: { xs: '29px', sm: '36px' },
      marginRight: { xs: '4px', sm: '8px' },
      transition: 'transform 0.2s ease'
    },
    companyName: {
      fontWeight: 'bold',
      color: '#2980b9',
      textTransform: 'none',
      display: { xs: 'none', sm: 'block' },
      fontSize: { xs: '1rem', sm: '1.25rem' }
    },
    navLinks: {
      display: { xs: 'none', md: 'flex' },
      alignItems: 'center',
      gap: 1
    },
    mobileMenu: {
      display: { xs: 'block', md: 'none' }
    },
    drawer: {
      '& .MuiDrawer-paper': {
        width: { xs: '85%', sm: 280 },
        maxWidth: 280,
        backgroundColor: '#fff',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
      }
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      borderBottom: '1px solid #eee',
      marginTop: '48px', // Add space for the AppBar
      backgroundColor: '#f8f9fa'
    },
    drawerLogo: {
      height: '29px',
      marginRight: '8px'
    },
    drawerCompanyName: {
      fontWeight: 'bold',
      color: '#2980b9',
      fontSize: '1.1rem'
    }
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#fff',
        color: '#333',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: (theme) => theme.zIndex.drawer + 1
      }}
    >
      <Toolbar>
        <Box 
          sx={responsiveStyles.logoContainer}
          onClick={() => navigate('/')}
        >
          <motion.img
            src={logo}
            alt="Prarthna Logo"
            style={responsiveStyles.logo}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Desktop Navigation */}
        <Box sx={responsiveStyles.navLinks}>
          {user ? (
            <>
              {user.role === 'customer' &&
                customerNavLinks.map((link) => (
                  <Button
                    key={link.to}
                    component={RouterLink}
                    to={link.to}
                    sx={getActiveLinkStyle(link.to)}
                  >
                    {link.name}
                  </Button>
                ))}
              {user.role === 'noter' &&
                noterNavLinks.map((link) => (
                  <Button
                    key={link.to}
                    component={RouterLink}
                    to={link.to}
                    sx={getActiveLinkStyle(link.to)}
                  >
                    {link.name}
                  </Button>
                ))}
              {user.role === 'admin' &&
                adminNavLinks.map((link) => (
                  <Button
                    key={link.to}
                    component={RouterLink}
                    to={link.to}
                    sx={getActiveLinkStyle(link.to)}
                  >
                    {link.name}
                  </Button>
                ))}
              <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: '#eee' }} />
              <Button 
                onClick={handleLogout} 
                sx={{
                  ...baseNavLinkStyle,
                  '&:hover': {
                    color: '#e74c3c',
                    backgroundColor: 'transparent'
                  }
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {publicNavLinks.map((link) => (
                <Button
                  key={link.to}
                  sx={getActiveScrollLinkStyle(link.to)}
                >
                  <ScrollLink
                    to={link.to}
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    onSetActive={(section) => setActiveSection(section)}
                  >
                    {link.name}
                  </ScrollLink>
                </Button>
              ))}
            </Box>
          )}
        </Box>

        {/* Mobile/Tablet Navigation */}
        <Box sx={responsiveStyles.mobileMenu}>
          <IconButton 
            edge="end" 
            color="inherit" 
            aria-label="menu" 
            onClick={handleDrawerToggle}
            sx={{ 
              color: '#2980b9',
              '&:hover': {
                backgroundColor: 'rgba(41, 128, 185, 0.1)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            variant="temporary"
            ModalProps={{ keepMounted: true }}
            sx={responsiveStyles.drawer}
          >
            <Box sx={{ width: '100%' }} role="presentation">
              {/* Add Drawer Header */}
              <Box sx={responsiveStyles.drawerHeader}>
                <img 
                  src={logo} 
                  alt="Prarthna Logo"
                  style={responsiveStyles.drawerLogo}
                />
                <Typography sx={responsiveStyles.drawerCompanyName}>
                  Prarthna Manufacturing
                </Typography>
              </Box>
              {/* User Info Section (if logged in) */}
              {user && (
                <Box sx={{ 
                  p: 2, 
                  borderBottom: '1px solid #eee',
                  backgroundColor: 'rgba(41, 128, 185, 0.05)'
                }}>
                  <Typography variant="subtitle1" sx={{ color: '#2980b9', fontWeight: 'bold' }}>
                    {user.email}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Typography>
                </Box>
              )}
              <List>{renderDrawerLinks()}</List>
            </Box>
          </Drawer>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
