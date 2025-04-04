// src/components/LandingPage.jsx
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Element } from 'react-scroll';
import { motion, useViewportScroll, useTransform } from 'framer-motion';
import ParticlesBackground from './ParticlesBackground';
import { Typewriter } from 'react-simple-typewriter';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  Divider,
  IconButton,
  Avatar,
  Link
} from '@mui/material';
import { LoginModal, SignupModal } from './Modals';

// Import icons
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FactoryIcon from '@mui/icons-material/Factory';
import EngineeringIcon from '@mui/icons-material/Engineering';
import SettingsIcon from '@mui/icons-material/Settings';
import InventoryIcon from '@mui/icons-material/Inventory';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactsIcon from '@mui/icons-material/Contacts';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Link as ScrollLink } from 'react-scroll';

const theme = {
  primary: '#0a192f',
  black: '#000000',
  text: {
    primary: '#0a192f',
    secondary: '#555555'
  },
  background: {
    light: 'rgba(10, 25, 47, 0.05)',
    lighter: 'rgba(10, 25, 47, 0.03)',
    white: 'rgba(255, 255, 255, 0.9)',
    glass: 'rgba(255, 255, 255, 0.7)'
  }
};

function LandingPage() {
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);

  // Hardcoded content that was previously fetched from the database
  const pageContent = {
    home: {
      headerTitle: 'Prarthna Manufacturing Pvt. Ltd.',
      typewriterWords: [
        'High-Quality Sheet Metal Products',
        'Cutting-Edge Fabrication',
        'Innovative Manufacturing Solutions',
        'State-of-the-art Infrastructure',
        'Robust Processes'
      ],
      services: {
        title: 'Services We Offer',
        description: 'We provide a comprehensive range of sheet metal fabrication services with precision engineering and advanced manufacturing capabilities.'
      },
      ctaButtons: {
        login: 'Login',
        signup: 'Signup'
      },
      serviceItems: [
        {
          icon: 'InventoryIcon',
          title: 'Quality Manufacturing'
        },
        {
          icon: 'SettingsIcon',
          title: 'Custom Engineering'
        },
        {
          icon: 'DirectionsCarIcon',
          title: 'Industry Solutions'
        },
        {
          icon: 'DesignServicesIcon',
          title: 'Process Engineering'
        }
      ]
    },
    about: {
      title: 'About Us & Capabilities',
      paragraphs: [
        "Prarthna Manufacturing Pvt. Ltd. is a leader in manufacturing sheet metal products in India. With operations across Bhandup and Khopoli near Mumbai, we deploy state-of-the-art systems and processes to manufacture various types of sheet metal products, components, parts, and articles. We are respected for our skills, innovation, craftsmanship, process engineering expertise, value engineering interventions, and quality of service.",
        "Our products cater to various industries: Furniture Industries, Switch Gear Industries, Automobile Industries, Warehouse / Storage Industries, Kitchen Metal Products, Home Appliance, Network Industries, Others.",
        "We support client processes with our decades of excellence in manufacturing sheet metal components, robust production planning, and process engineering expertise."
      ],
      industries: [
        {
          icon: 'InventoryIcon',
          name: 'Furniture Industries'
        },
        {
          icon: 'SettingsIcon',
          name: 'Switch Gear Industries'
        },
        {
          icon: 'DirectionsCarIcon',
          name: 'Automobile Industries'
        }
      ],
      capabilities: [
        {
          icon: 'EngineeringIcon',
          title: 'Precision Engineering',
          description: 'Our team of expert engineers ensures the highest level of precision in every component we manufacture, bringing years of expertise and craftsmanship to every project.'
        },
        {
          icon: 'SettingsIcon',
          title: 'Advanced Manufacturing',
          description: 'State-of-the-art infrastructure across two future-ready facilities delivers consistent quality and efficient production for all sheet metal components.'
        }
      ],
      whyChooseUs: [
        {
          title: 'Vast Experience',
          description: 'Decades of excellence with unparalleled industry exposure'
        },
        {
          title: 'Global Expertise',
          description: 'Local operations with international quality standards'
        },
        {
          title: 'Robust Processes',
          description: 'Proven production planning and management capabilities'
        },
        {
          title: 'Client Support',
          description: 'All-round capabilities for supporting client processes'
        }
      ]
    },
    contact: {
      title: 'Contact Us',
      introduction: 'Reach out to us for any inquiries or information about our products and services.',
      address: '15 A, Samrat Silk mill Compound, LBS marg, Vikhroli West, Mumbai, Maharashtra, India – 400079.',
      email: 'info@prarthna.co.in',
      telephone: '022-21670086 / 87',
      googleMapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.5873768885904!2d72.93424474999999!3d19.17095545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b8dd9a3b54a7%3A0xc963a4c56025fbb5!2sPrarthna%20Manufacturing%20Pvt.%20Ltd.!5e0!3m2!1sen!2sin!4v1710766921937!5m2!1sen!2sin'
    }
  };

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

  const handleArrowClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
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
          <Box 
            component={motion.div}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            sx={{
              mb: 2,
              position: 'relative',
              display: 'inline-block'
            }}
          >
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 800, 
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #0a192f 100%)',
                backgroundSize: '200% auto',
                animation: 'gradient 3s linear infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 5px 15px rgba(0,0,0,0.1)',
                letterSpacing: '0.5px',
                position: 'relative',
                px: 2,
                '@keyframes gradient': {
                  '0%': {
                    backgroundPosition: '0% center'
                  },
                  '100%': {
                    backgroundPosition: '200% center'
                  }
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '80%',
                  height: '4px',
                  background: 'linear-gradient(90deg, transparent, #0a192f, transparent)',
                  bottom: '0',
                  left: '10%'
                }
              }}
            >
            {pageContent.home.headerTitle}
          </Typography>
          </Box>
          
          <Box sx={{ 
            fontSize: { xs: '1.3rem', sm: '1.8rem' }, 
            fontWeight: 'bold',
            color: '#1a237e', 
            mb: 5,
            display: 'inline-block',
            textShadow: '0 2px 5px rgba(41, 128, 185, 0.2)'
          }}>
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
            sx={{ 
              mb: 5,
              p: 3,
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(15px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              maxWidth: '600px',
              width: '100%'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <FactoryIcon sx={{ fontSize: 32, color: theme.primary, mr: 1 }} />
            <Typography variant="h5" sx={{ color: theme.primary, fontWeight: 'bold' }}>
              {pageContent.home.services.title}
            </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ color: '#555', mb: 3 }}>
              {pageContent.home.services.description}
            </Typography>
            
            <Grid container spacing={2}>
              {pageContent.home.serviceItems.map((item, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.3s',
                      '&:hover': {
                        backgroundColor: 'rgba(41, 128, 185, 0.1)',
                        transform: 'translateY(-5px)'
                      }
                    }}
                  >
                    <Avatar sx={{ bgcolor: theme.background.light, color: theme.primary, mr: 2 }}>
                      {item.icon === 'InventoryIcon' && <InventoryIcon />}
                      {item.icon === 'SettingsIcon' && <SettingsIcon />}
                      {item.icon === 'DirectionsCarIcon' && <DirectionsCarIcon />}
                      {item.icon === 'DesignServicesIcon' && <DesignServicesIcon />}
                    </Avatar>
                    <Typography variant="body1" fontWeight="500">{item.title}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
          
          <Box mt={2} sx={{ display: 'flex', gap: 2, mb: 8 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                size="large"
                sx={{ 
                  backgroundColor: theme.primary, 
                  ':hover': { backgroundColor: theme.black },
                  px: 4,
                  py: 1,
                  borderRadius: '30px',
                  fontWeight: 'bold'
                }}
                onClick={() => setOpenLogin(true)}
              >
                {pageContent.home.ctaButtons.login}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                size="large"
                sx={{ 
                  color: theme.black, 
                  borderColor: theme.black, 
                  ':hover': { color: theme.primary, borderColor: theme.primary },
                  px: 4,
                  py: 1,
                  borderRadius: '30px',
                  fontWeight: 'bold'
                }}
                onClick={() => setOpenSignup(true)}
              >
                {pageContent.home.ctaButtons.signup}
              </Button>
            </motion.div>
          </Box>

          <Box sx={{ 
            position: 'absolute', 
            bottom: 5,
            mt: 8,
            zIndex: 1000,
            pointerEvents: 'auto',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            overflow: 'visible'
          }}>
            <motion.div 
              initial={{ y: 0 }}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ 
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 1000
              }}
            >
              <IconButton 
                onClick={handleArrowClick}
                sx={{ 
                  color: theme.primary,
                  pointerEvents: 'auto',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)'
                  }
                }}
              >
                <ArrowDownwardIcon fontSize="large" />
              </IconButton>
            </motion.div>
          </Box>
        </Box>
      </Element>

      {/* About Section */}
      <Element name="about">
        <Container
          id="about"
          maxWidth="lg"
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ 
            py: 8, 
            position: 'relative', 
            zIndex: 0,
            overflow: 'visible'
          }}
        >
          <Box sx={{ 
            mb: 6, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              px: 3,
              py: 1.5,
              borderRadius: '50px',
              backgroundColor: theme.background.light
            }}>
              <InfoIcon sx={{ color: theme.primary, mr: 1.5, fontSize: 28 }} />
              <Typography variant="h4" sx={{ color: theme.primary, fontWeight: 'bold' }}>
            {pageContent.about.title}
          </Typography>
            </Box>
            <Divider sx={{ width: '120px', borderColor: theme.primary, borderWidth: 2, mb: 4 }} />
          </Box>

          <Card sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
            backdropFilter: 'blur(15px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: theme.primary, 
                        fontWeight: 'bold', 
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: '2px solid rgba(26, 35, 126, 0.2)',
                        pb: 1
                      }}
                    >
                      <EngineeringIcon sx={{ mr: 1 }} /> Our Expertise
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.8 }}>
                      {pageContent.about.paragraphs[0]}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ 
                      color: theme.primary, 
                      fontWeight: 'bold', 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '2px solid rgba(26, 35, 126, 0.2)',
                      pb: 1
                    }}>
                      <InventoryIcon sx={{ mr: 1 }} /> Industries We Serve
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {pageContent.about.industries.map((industry, index) => (
                        <Grid item xs={12} key={index}>
                          <Paper sx={{ 
                            p: 2, 
                            backgroundColor: theme.background.light,
                            display: 'flex',
                            alignItems: 'center',
                            borderLeft: `4px solid ${theme.primary}`,
                            borderRadius: '4px'
                          }}>
                            <Avatar sx={{ bgcolor: theme.background.white, color: theme.primary, mr: 2 }}>
                              {industry.icon === 'InventoryIcon' && <InventoryIcon />}
                              {industry.icon === 'SettingsIcon' && <SettingsIcon />}
                              {industry.icon === 'DirectionsCarIcon' && <DirectionsCarIcon />}
                              {industry.icon === 'DesignServicesIcon' && <DesignServicesIcon />}
                            </Avatar>
                            <Typography variant="body1" fontWeight="medium">{industry.name}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Typography variant="h5" sx={{ 
                      color: theme.primary, 
                      fontWeight: 'bold', 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '2px solid rgba(26, 35, 126, 0.2)',
                      pb: 1
                    }}>
                      <DesignServicesIcon sx={{ mr: 1 }} /> Our Capabilities
                    </Typography>
                    
                    <Box sx={{ 
                      mb: 3,
                      flex: 1
                    }}>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 3, 
                          backgroundColor: theme.background.lighter,
                          borderRadius: '8px',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <Box>
                          {pageContent.about.capabilities.map((capability, index) => (
                            <Box key={index} sx={{ 
                              display: 'flex', 
                              alignItems: 'flex-start', 
                              mb: index < pageContent.about.capabilities.length - 1 ? 3 : 0 
                            }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: theme.background.white, 
                                  color: theme.primary, 
                                  mr: 2,
                                  mt: 0.5
                                }}
                              >
                                {capability.icon === 'EngineeringIcon' && <EngineeringIcon />}
                                {capability.icon === 'SettingsIcon' && <SettingsIcon />}
                                {capability.icon === 'DesignServicesIcon' && <DesignServicesIcon />}
                                {capability.icon === 'InventoryIcon' && <InventoryIcon />}
                              </Avatar>
                              <Box>
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ fontWeight: 'bold', color: theme.primary, mb: 0.5 }}
                                >
                                  {capability.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>
                                  {capability.description}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    </Box>

                    <Box>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2.5, 
                          backgroundColor: theme.background.lighter,
                          borderRadius: '8px'
                        }}
                      >
                        <Typography variant="h6" sx={{ 
                          color: theme.primary, 
                          fontWeight: 'bold', 
                          mb: 1.5,
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <BusinessIcon sx={{ mr: 1, color: theme.primary }} /> Why Choose Us
                        </Typography>
                        <Grid container spacing={1.5}>
                          {pageContent.about.whyChooseUs.map((reason, index) => (
                            <Grid item xs={6} key={index}>
                              <Box sx={{ 
                                p: 1.5, 
                                borderRadius: '8px',
                                border: `1px solid ${theme.background.light}`,
                                height: '100%',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: theme.background.light,
                                  transform: 'translateY(-2px)'
                                }
                              }}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    fontWeight: 'bold',
                                    color: theme.primary,
                                    mb: 0.5
                                  }}
                                >
                                  {reason.title}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: theme.text.secondary,
                                    lineHeight: 1.6
                                  }}
                                >
                                  {reason.description}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </Element>

      {/* Contact Section */}
      <Element name="contact">
        <Container
          id="contact"
          maxWidth="lg"
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ py: 8, position: 'relative', zIndex: 0 }}
        >
          <Box sx={{ 
            mb: 6, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              px: 3,
              py: 1.5,
              borderRadius: '50px',
              backgroundColor: theme.background.light
            }}>
              <ContactsIcon sx={{ color: theme.primary, mr: 1.5, fontSize: 28 }} />
              <Typography variant="h4" sx={{ color: theme.primary, fontWeight: 'bold' }}>
            {pageContent.contact.title}
          </Typography>
            </Box>
            <Divider sx={{ width: '120px', borderColor: theme.primary, borderWidth: 2, mb: 4 }} />
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Card sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(15px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                borderRadius: '16px',
                height: '100%'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="body1" sx={{ color: '#555', mb: 4 }}>
            {pageContent.contact.introduction}
          </Typography>
                  
                  <Box sx={{ 
                    display: 'flex',  
                    mb: 3,
                    alignItems: 'flex-start'
                  }}>
                    <Avatar sx={{ bgcolor: theme.background.light, mr: 2 }}>
                      <BusinessIcon sx={{ color: theme.primary }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                        Our Address
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        {pageContent.contact.address}
          </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    mb: 3,
                    alignItems: 'flex-start'
                  }}>
                    <Avatar sx={{ bgcolor: theme.background.light, mr: 2 }}>
                      <EmailIcon sx={{ color: theme.primary }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                        Email Us
          </Typography>
                      <Link 
                        href={`mailto:${pageContent.contact.email}`} 
                        underline="hover"
                        sx={{ color: theme.primary }}
                      >
                        {pageContent.contact.email}
                      </Link>
                    </Box>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start'
                  }}>
                    <Avatar sx={{ bgcolor: theme.background.light, mr: 2 }}>
                      <LocalPhoneIcon sx={{ color: theme.primary }} />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                        Call Us
          </Typography>
                      <Link 
                        href={`tel:${pageContent.contact.telephone}`} 
                        underline="hover"
                        sx={{ color: theme.primary }}
                      >
                        {pageContent.contact.telephone}
                      </Link>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <Box sx={{ 
                width: '100%', 
                height: '400px', 
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
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
            </Grid>
          </Grid>
        </Container>
      </Element>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          position: 'relative',
          zIndex: 0,
          mt: 4
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" align="center" color="text.secondary">
            © {new Date().getFullYear()} Prarthna Manufacturing Pvt. Ltd. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Login & Signup Modals */}
      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      <SignupModal open={openSignup} onClose={() => setOpenSignup(false)} />
    </Box>
  );
}

export default LandingPage;
