import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Element } from 'react-scroll';
import { motion } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';
import { Typewriter } from 'react-simple-typewriter';
import { Box, Button, Typography, Container } from '@mui/material';
import { LoginModal, SignupModal } from './Modals';

function LandingPage() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);

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

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
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
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#000' }}>
            Prarthna Manufacturing Pvt. Ltd.
          </Typography>
          <Box sx={{ fontSize: '1.5rem', color: '#444', mb: 3 }}>
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
            <Button
              variant="contained"
              sx={{ mx: 1, backgroundColor: '#2980b9', ':hover': { backgroundColor: '#2471A3' } }}
              onClick={() => setOpenLogin(true)}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              sx={{ mx: 1, color: '#333', borderColor: '#333', ':hover': { color: '#2980b9', borderColor: '#2980b9' } }}
              onClick={() => setOpenSignup(true)}
            >
              Signup
            </Button>
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
            About Us & Capabilities
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mt: 2 }}>
            Prarthna Manufacturing Pvt. Ltd. is a leader in manufacturing sheet metal products in India.
            With operations across Bhandup and Khopoli near Mumbai, we deploy state-of-the-art systems and
            processes to manufacture various types of sheet metal products, components, parts, and articles.
            We are respected for our skills, innovation, craftsmanship, process engineering expertise,
            value engineering interventions, and quality of service.
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mt: 2 }}>
            Our products cater to various industries:
            <br />• Furniture Industries
            <br />• Switch Gear Industries
            <br />• Automobile Industries
            <br />• Warehouse / Storage Industries
            <br />• Kitchen Metal Products
            <br />• Home Appliance
            <br />• Network Industries
            <br />• Others
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mt: 2 }}>
            We support client processes with our decades of excellence in manufacturing sheet metal components,
            robust production planning, and process engineering expertise.
          </Typography>
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
            Contact Us
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mt: 2 }}>
            Reach out to us for any inquiries or information.
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mt: 2 }}>
            Address: Kedia Industrial Area, Dheku, Village, Khalapur, Maharashtra 410203
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mt: 1 }}>
            Email: info@prarthna.co.in
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', mt: 1 }}>
            Telephone: 022 2167 0087
          </Typography>
          <Box sx={{ width: '100%', height: '400px', mt: 4 }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15918.218460704233!2d72.93424474999999!3d19.170955449999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b9a5f4c2d9d3%3A0xd6cbe991983dad0!2sRedwoods%20Co-operative%20Housing%20Society%20B-Wing!5e1!3m2!1sen!2sin!4v1739953071938!5m2!1sen!2sin"
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
