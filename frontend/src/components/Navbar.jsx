import React, { useContext, useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-scroll';
import logo from '../assets/logo.png';

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState('home');

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  // Intersection Observer logic to update active section
  useEffect(() => {
    const sectionNames = ['home', 'about', 'products', 'capabilities', 'contact'];
    const observerOptions = {
      root: null,
      rootMargin: '-70px 0px 0px 0px',
      threshold: 0.6,
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

    // Delay to ensure LandingPage sections are mounted
    setTimeout(() => {
      sectionNames.forEach((name) => {
        const element = document.getElementById(name) || document.querySelector(`[name="${name}"]`);
        if (element) {
          observer.observe(element);
        }
      });
    }, 300);

    return () => observer.disconnect();
  }, []);

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#fff',
        color: '#333',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        {/* Logo & Company Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <img src={logo} alt="Prarthna Logo" style={{ height: '40px', marginRight: '8px' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#007BFF' }}>
            Prarthna Manufacturing Pvt. Ltd.
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {[
            { name: 'Home', to: 'home' },
            { name: 'About Us', to: 'about' },
            { name: 'Products', to: 'products' },
            { name: 'Our Capabilities', to: 'capabilities' },
            { name: 'Contact Us', to: 'contact' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              spy={true}
              smooth={true}
              offset={-70}
              duration={500}
              onSetActive={(section) => {
                // Fallback update if observer doesn't trigger
                setActiveSection(section);
              }}
              style={{
                cursor: 'pointer',
                textDecoration: 'none',
                color: activeSection === link.to ? '#007BFF' : '#666',
                fontWeight: activeSection === link.to ? 'bold' : 'normal',
                transition: 'color 0.2s ease',
              }}
            >
              {link.name}
            </Link>
          ))}
        </Box>

        {user && (
          <Button color="inherit" onClick={handleLogout} sx={{ ml: 3 }}>
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
