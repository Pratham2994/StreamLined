// src/components/LandingPage.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Element } from 'react-scroll';
import { motion, useViewportScroll, useTransform } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';
import { Typewriter } from 'react-simple-typewriter';
import { Box, Button, Typography, Container } from '@mui/material';
import { LoginModal, SignupModal } from './Modals';

function LandingPage() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [pageContent, setPageContent] = useState(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/config/page-content');
        const data = await response.json();
        setPageContent(data);
      } catch (error) {
        console.error('Error fetching page content:', error);
      }
    };

    fetchPageContent();
  }, []);

  // Auto-redirect if a valid user session exists.
  useEffect(() => {
    if (!loading && user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'customer':
          navigate('/customer');
          break;
        case 'noter':
          navigate('/noter');
          break;
        default:
          break;
      }
    }
  }, [user, loading, navigate]);

  // Parallax effect for the gradient background
  const { scrollY } = useViewportScroll();
  const y = useTransform(scrollY, [0, 500], [0, -50]);

  if (!pageContent) return null;

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* Gradient Background with Parallax */}
      <Box
        component={motion.div}
        style={{ y }}
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f4f4f4 100%)'
        }}
      />

      {/* Particles Background */}
      <Box sx={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <ParticlesBackground />
      </Box>

      {/* Home Section */}
      <Element name="home">
        <Box
          id="home"
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: '100vh',
            px: 2,
            position: 'relative',
            zIndex: 0
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#000' }}>
            {pageContent.home.headerTitle}
          </Typography>
          <Box sx={{ fontSize: '1.5rem', color: '#444', mb: 3 }}>
            <Typewriter
              words={pageContent.home.typewriterWords}
              loop={0}
              cursor
              typeSpeed={40}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </Box>
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            sx={{ mb: 3 }}
          >
            <Typography variant="h5" sx={{ color: '#2980b9', fontWeight: 'bold' }}>
              {pageContent.home.services.title}
            </Typography>
            <Typography variant="body1" sx={{ color: '#555' }}>
              {pageContent.home.services.description}
            </Typography>
          </Box>
          <Box mt={2} sx={{ display: 'flex', gap: 2 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#2980b9', ':hover': { backgroundColor: '#2471A3' } }}
                onClick={() => setOpenLogin(true)}
              >
                {pageContent.home.ctaButtons.login}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                sx={{ color: '#333', borderColor: '#333', ':hover': { color: '#2980b9', borderColor: '#2980b9' } }}
                onClick={() => setOpenSignup(true)}
              >
                {pageContent.home.ctaButtons.signup}
              </Button>
            </motion.div>
          </Box>
        </Box>
      </Element>

      {/* About Section */}
      <Element name="about">
        <Container
          id="about"
          maxWidth="md"
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ py: 4, position: 'relative', zIndex: 0 }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#000', fontWeight: 'bold' }}>
            {pageContent.about.title}
          </Typography>
          {pageContent.about.paragraphs.map((paragraph, index) => (
            <Typography key={index} variant="body1" sx={{ color: '#555', mt: 2 }}>
              {paragraph}
            </Typography>
          ))}
        </Container>
      </Element>

      {/* Contact Section */}
      <Element name="contact">
        <Container
          id="contact"
          maxWidth="md"
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ py: 4, position: 'relative', zIndex: 0 }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#000', fontWeight: 'bold' }}>
            {pageContent.contact.title}
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mt: 2 }}>
            {pageContent.contact.introduction}
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mt: 2 }}>
            Address: {pageContent.contact.address}
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mt: 1 }}>
            Email: {pageContent.contact.email}
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mt: 1 }}>
            Telephone: {pageContent.contact.telephone}
          </Typography>
          <Box sx={{ width: '100%', height: '400px', mt: 4 }}>
            <iframe
              src={pageContent.contact.googleMapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Google Map"
            ></iframe>
          </Box>
        </Container>
      </Element>

      {/* Login & Signup Modals */}
      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      <SignupModal open={openSignup} onClose={() => setOpenSignup(false)} />
    </Box>
  );
}

export default LandingPage;
