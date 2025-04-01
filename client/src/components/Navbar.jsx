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
import { 
  Home, 
  ShoppingCart, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Info, 
  Phone,
  ChevronRight
} from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // Add scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Base nav link style
  const baseNavLinkStyle = {
    cursor: 'pointer',
    textDecoration: 'none',
    textTransform: 'none',
    color: '#666',
    fontWeight: 'normal',
    transition: 'all 0.2s ease',
    mx: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
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
    { name: 'Home', to: '/customer', icon: <Home size={18} /> },
    { name: 'My Cart', to: '/customer/cart', icon: <ShoppingCart size={18} /> },
    { name: 'My Orders', to: '/customer/orders', icon: <ClipboardList size={18} /> }
  ];

  const noterNavLinks = [
    { name: 'Home', to: '/noter', icon: <Home size={18} /> },
    { name: 'My Cart', to: '/noter/cart', icon: <ShoppingCart size={18} /> }
  ];

  const adminNavLinks = [
    { name: 'Dashboard', to: '/admin', icon: <Home size={18} /> },
    { name: 'Config', to: '/admin/config', icon: <Settings size={18} /> }
  ];

  const publicNavLinks = [
    { name: 'Home', to: 'home', icon: <Home size={18} /> },
    { name: 'About & Capabilities', to: 'about', icon: <Info size={18} /> },
    { name: 'Contact Us', to: 'contact', icon: <Phone size={18} /> }
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  {link.icon}
                  <ListItemText
                    primary={
                      <Typography sx={{ color: location.pathname === link.to ? '#2980b9' : '#666' }}>
                        {link.name}
                      </Typography>
                    }
                  />
                  <ChevronRight size={16} color="#666" />
                </Box>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <LogOut size={18} />
                <ListItemText primary="Logout" />
                <ChevronRight size={16} color="#666" />
              </Box>
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
                  if (link.to === 'home' || link.to === 'about' || link.to === 'contact') {
                    setTimeout(() => {
                      const element = document.getElementById(link.to);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        setActiveSection(link.to);
                      }
                    }, 300);
                  }
                }}
                sx={{
                  borderLeft: activeSection === link.to ? '4px solid #2980b9' : '4px solid transparent',
                  backgroundColor: activeSection === link.to ? 'rgba(41, 128, 185, 0.1)' : 'transparent'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  {link.icon}
                  <ListItemText
                    primary={
                      <Typography sx={{ color: activeSection === link.to ? '#2980b9' : '#666' }}>
                        {link.name}
                      </Typography>
                    }
                  />
                  <ChevronRight size={16} color="#666" />
                </Box>
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
      height: '100%',
      padding: '8px 0',
      '&:hover img': {
        transform: 'scale(1.05)'
      }
    },
    logo: {
      height: '36px',
      width: 'auto',
      marginRight: '8px',
      transition: 'transform 0.2s ease',
      objectFit: 'contain'
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
      padding: '12px 16px',
      borderBottom: '1px solid #eee',
      marginTop: '58px',
      backgroundColor: '#f8f9fa'
    },
    drawerLogo: {
      height: '30px',
      width: 'auto',
      marginRight: '8px',
      objectFit: 'contain'
    },
    drawerCompanyName: {
      fontWeight: 'bold',
      color: '#2980b9',
      fontSize: '1rem'
    }
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: scrolled ? '#fff' : 'transparent',
        color: '#333',
        boxShadow: scrolled ? '0 1px 5px rgba(0,0,0,0.1)' : 'none',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        height: { xs: '58px', sm: '66px' },
        transition: 'all 0.3s ease'
      }}
      elevation={scrolled ? 1 : 0}
    >
      <Toolbar sx={{ minHeight: { xs: '58px', sm: '66px' }, px: { xs: 1, sm: 2 } }}>
        <Box 
          sx={responsiveStyles.logoContainer}
          onClick={() => navigate('/')}
        >
          <motion.img 
            src={logo}
            alt="Prarthna Logo"
            style={{
              height: '55px',
              width: '75px',
              objectFit: 'contain'
            }}
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
                    {link.icon}
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
                    {link.icon}
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
                    {link.icon}
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
                <LogOut size={18} />
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
                  {link.icon}
                  <ScrollLink
                    to={link.to}
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    onSetActive={(section) => setActiveSection(section)}
                    onClick={() => {
                      setTimeout(() => {
                        const element = document.getElementById(link.to);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 0);
                    }}
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
