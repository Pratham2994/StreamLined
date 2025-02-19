import React, { useState } from 'react';
import { Element } from 'react-scroll';
import { motion } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';
import { Typewriter } from 'react-simple-typewriter';
import { Box, Button, Typography, Container } from '@mui/material';
import { LoginModal, SignupModal } from './Modals';

function LandingPage() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);

  return (
    <Box sx={{ width: '100%', overflowX: 'hidden', position: 'relative', height: '100%' }}>
      {/* Gradient Background */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: -2,
          background: 'linear-gradient(135deg, #ffffff 0%, #f4f4f4 100%)',
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
            zIndex: 0,
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
            Prarthna Manufacturing Pvt. Ltd.
          </Typography>

          <Box sx={{ fontSize: '1.5rem', color: '#333', mb: 3 }}>
            <Typewriter
              words={[
                'High-Quality Sheet Metal Products',
                'Cutting-Edge Fabrication',
                'Innovative Manufacturing Solutions',
              ]}
              loop={0}
              cursor
              typeSpeed={40}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </Box>
          <Box mt={2}>
            <Button variant="contained" sx={{ mx: 1 }} onClick={() => setOpenLogin(true)}>
              Login
            </Button>
            <Button
              variant="outlined"
              sx={{
                mx: 1,
                color: '#333',
                borderColor: '#333',
                ':hover': { color: '#007BFF', borderColor: '#007BFF' },
              }}
              onClick={() => setOpenSignup(true)}
            >
              Signup
            </Button>
          </Box>
        </Box>
      </Element>

      {/* About Us Section */}
      <Element name="about">
        <Container
          id="about"
          maxWidth="md"
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ py: 8, minHeight: '100vh', position: 'relative', zIndex: 0 }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#333' }}>
            About Us
          </Typography>
          <Typography variant="body1" sx={{ color: '#555' }}>
            Prarthna Manufacturing Pvt. Ltd. is a leader in manufacturing sheet metal products in India.
            With operations across Bhandup and Khopoli near Mumbai, we deploy state-of-the-art systems and
            processes to manufacture various types of sheet metal products, components, parts, and articles.
            We are respected for our skills, innovation, craftsmanship, process engineering expertise,
            value engineering interventions, and quality of service.
          </Typography>
        </Container>
      </Element>

      {/* Products Section */}
      <Element name="products">
        <Container
          id="products"
          maxWidth="md"
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ py: 8, minHeight: '100vh', position: 'relative', zIndex: 0 }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#333' }}>
            Products
          </Typography>
          <Typography variant="body1" sx={{ color: '#555' }}>
            This is a dummy section for Products. Add your product details here.
          </Typography>
        </Container>
      </Element>

      {/* Our Capabilities Section */}
      <Element name="capabilities">
        <Container
          id="capabilities"
          maxWidth="md"
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ py: 8, minHeight: '100vh', position: 'relative', zIndex: 0 }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#333' }}>
            Our Capabilities
          </Typography>
          <Typography variant="body1" sx={{ color: '#555' }}>
            This is a dummy section for Our Capabilities. Describe your capabilities here.
          </Typography>
        </Container>
      </Element>

      {/* Contact Us Section */}
      <Element name="contact">
        <Container
          id="contact"
          maxWidth="md"
          component={motion.div}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ py: 8, minHeight: '100vh', position: 'relative', zIndex: 0 }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#333' }}>
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mb: 4 }}>
            Reach out to us for any inquiries or information.
          </Typography>
          <Box sx={{ width: '100%', height: '400px' }}>
            <iframe
              // src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7384317192873!2d73.30029321090905!3d18.786933760909847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be807937524ab47%3A0x10e6b511fd36619b!2sPrarthna%20Manufacturing%20Pvt%20Ltd!5e1!3m2!1sen!2sin!4v1739893541270!5m2!1sen!2sin"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.2831224036577!2d72.93630101091688!3d19.182195248554915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b85336ffa96f%3A0x2cb58e4560eda690!2sRedwoods%20Co-operative%20Housing%20Society!5e1!3m2!1sen!2sin!4v1739896373540!5m2!1sen!2sin"
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
