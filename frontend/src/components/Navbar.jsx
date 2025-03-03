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
  useTheme
} from '@mui/material';
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

  // Use Material UI breakpoints
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // ========== Base Styles for Nav Items ==========
  const baseNavLinkStyle = {
    cursor: 'pointer',
    textDecoration: 'none',
    textTransform: 'none',
    color: '#666',
    fontWeight: 'normal',
    transition: 'color 0.2s ease',
    '&:hover': {
      color: '#2980b9'
    }
  };

  // ========== Highlight Active Link ==========
  const getActiveLinkStyle = (linkPath) => {
    const isActive = location.pathname === linkPath;
    return {
      ...baseNavLinkStyle,
      color: isActive ? '#2980b9' : '#666',
      fontWeight: isActive ? 'bold' : 'normal'
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

  // Define navigation links for customers and noters separately
  const customerNavLinks = [
    { name: 'Home', to: '/customer' },
    { name: 'My Cart', to: '/customer/cart' },
    { name: 'My Orders', to: '/customer/orders' }
  ];

  const noterNavLinks = [
    { name: 'Home', to: '/noter' },
    { name: 'My Cart', to: '/noter/cart' }
  ];

  const navLinks = [
    { name: 'Home', to: 'home' },
    { name: 'About & Capabilities', to: 'about' },
    { name: 'Contact Us', to: 'contact' }
  ];

  // Toggle Drawer (Mobile)
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#fff',
        color: '#333',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        {/* Logo + Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img src={logo} alt="Prarthna Logo" style={{ height: '40px', marginRight: '8px' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2980b9', textTransform: 'none' }}>
            Prarthna Manufacturing Pvt. Ltd.
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* ================= Mobile / Tablet Nav ================= */}
        {isSmallScreen ? (
          <>
            {user && (user.role === 'customer' || user.role === 'noter') ? (
              <Button sx={baseNavLinkStyle} onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <IconButton edge="end" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
            )}

            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              variant="temporary"
              ModalProps={{ keepMounted: true }}
            >
              <Box sx={{ width: 250 }} role="presentation">
                <List>
                  {user && (user.role === 'customer' || user.role === 'noter') ? (
                    <>
                      {(user.role === 'customer' ? customerNavLinks : noterNavLinks).map((link) => (
                        <ListItem key={link.to} disablePadding>
                          <ListItemButton
                            onClick={() => {
                              setDrawerOpen(false);
                              navigate(link.to);
                            }}
                          >
                            <ListItemText primary={<span style={getActiveLinkStyle(link.to)}>{link.name}</span>} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => {
                            setDrawerOpen(false);
                            handleLogout();
                          }}
                        >
                          <ListItemText primary={<span style={baseNavLinkStyle}>Logout</span>} />
                        </ListItemButton>
                      </ListItem>
                    </>
                  ) : (
                    <>
                      {navLinks.map((link) => (
                        <ListItem key={link.to} disablePadding>
                          <ListItemButton onClick={() => setDrawerOpen(false)}>
                            <ListItemText>
                              <ScrollLink
                                to={link.to}
                                spy={true}
                                smooth={true}
                                offset={-70}
                                duration={500}
                                onSetActive={(section) => setActiveSection(section)}
                                style={getActiveLinkStyle(link.to)}
                              >
                                {link.name}
                              </ScrollLink>
                            </ListItemText>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </>
                  )}
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          /* ================= Desktop Nav ================= */
          <>
            {user && (user.role === 'customer' || user.role === 'noter') ? (
              <Box sx={{ display: 'flex', gap: 2 }}>
                {(user.role === 'customer' ? customerNavLinks : noterNavLinks).map((link) => (
                  <Button
                    key={link.to}
                    component={RouterLink}
                    to={link.to}
                    sx={getActiveLinkStyle(link.to)}
                  >
                    {link.name}
                  </Button>
                ))}
                <Button onClick={handleLogout} sx={baseNavLinkStyle}>
                  Logout
                </Button>
              </Box>
            ) : (
              <>
                {!user && (
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    {navLinks.map((link) => (
                      <ScrollLink
                        key={link.to}
                        to={link.to}
                        spy={true}
                        smooth={true}
                        offset={-70}
                        duration={500}
                        onSetActive={(section) => setActiveSection(section)}
                        style={getActiveLinkStyle(link.to)}
                      >
                        {link.name}
                      </ScrollLink>
                    ))}
                  </Box>
                )}
                {user && user.role === 'admin' && (
                  <Button onClick={handleLogout} sx={baseNavLinkStyle}>
                    Logout
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
