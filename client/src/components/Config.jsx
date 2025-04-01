import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Backdrop,
  Grid as MuiGrid
} from '@mui/material';
import { motion } from 'framer-motion';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ParticlesBackground from './ParticlesBackground';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Papa from 'papaparse';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Config() {
  const [tabValue, setTabValue] = useState(0);
  const [productList, setProductList] = useState([]);
  const [pageContent, setPageContent] = useState({
    home: {
      headerTitle: 'Prarthna Manufacturing Pvt. Ltd.',
      typewriterWords: [
        'High-Quality Sheet Metal Products',
        'Cutting-Edge Fabrication',
        'Innovative Manufacturing Solutions'
      ],
      services: {
        title: 'Our Services',
        description: 'Fabrication • Innovation • Reliability'
      },
      ctaButtons: {
        login: 'Login',
        signup: 'Signup'
      }
    },
    about: {
      title: 'About Us & Capabilities',
      paragraphs: [
        "Prarthna Manufacturing Pvt. Ltd. is a leader in manufacturing sheet metal products in India. With operations across Bhandup and Khopoli near Mumbai, we deploy state-of-the-art systems and processes to manufacture various types of sheet metal products, components, parts, and articles. We are respected for our skills, innovation, craftsmanship, process engineering expertise, value engineering interventions, and quality of service.",
        "Our products cater to various industries: Furniture Industries, Switch Gear Industries, Automobile Industries, Warehouse / Storage Industries, Kitchen Metal Products, Home Appliance, Network Industries, Others.",
        "We support client processes with our decades of excellence in manufacturing sheet metal components, robust production planning, and process engineering expertise."
      ]
    },
    contact: {
      title: 'Contact Us',
      introduction: 'Reach out to us for any inquiries or information.',
      address: 'Kedia Industrial Area, Dheku, Village, Khalapur, Maharashtra 410203',
      email: 'info@prarthna.co.in',
      telephone: '022 2167 0087',
      googleMapEmbedUrl:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15918.218460704233!2d72.93424474999999!3d19.170955449999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b9a5f4c2d9d3%3A0xd6cbe991983dad0!2sRedwoods%20Co-operative%20Housing%20Society%20B-Wing!5e1!3m2!1sen!2sin!4v1739953071938!5m2!1sen!2sin'
    }
  });
  const [editingSection, setEditingSection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastContainerKey, setToastContainerKey] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchPageContent();
  }, []);

  // Force a re-render of ToastContainer
  useEffect(() => {
    setToastContainerKey(prev => prev + 1);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products');
      const data = await res.json();
      setProductList(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    }
  };

  const fetchPageContent = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/config/page-content', {
        credentials: 'include'
      });
      const data = await res.json();
      setPageContent(data);
    } catch (error) {
      console.error('Error fetching page content:', error);
      toast.error('Error loading page content');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProductChange = (index, field, value) => {
    const updated = productList.map((prod, i) => {
      if (i === index) {
        return { ...prod, [field]: value };
      }
      return prod;
    });
    setProductList(updated);
  };

  const handleSaveProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ products: productList })
      });

      const data = await response.json();

      if (response.ok) {
        await fetchProducts();
        toast.success('Products updated successfully', {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else if (response.status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment before trying again.', {
          position: "bottom-right",
          autoClose: 3000,
        });
      } else {
        toast.error(`Failed to update products: ${data.message || 'Unknown error occurred'}`, {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error saving products:', error);
      toast.error(`Error saving products: ${error.message || 'Network error occurred'}`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/config/page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(pageContent)
      });

      const data = await response.json();

      if (response.ok) {
        await fetchPageContent();
        toast.success('Page content updated successfully', {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else if (response.status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment before trying again.', {
          position: "bottom-right",
          autoClose: 3000,
        });
      } else {
        toast.error(`Failed to update content: ${data.message || 'Unknown error occurred'}`, {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Error saving page content:', error);
      toast.error(`Error saving page content: ${error.message || 'Network error occurred'}`, {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (section, field, value) => {
    setPageContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'text/csv') {
      toast.error('Please upload a CSV file', {
        position: "bottom-right",
        autoClose: 3000
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          toast.error('Error parsing CSV file', {
            position: "bottom-right",
            autoClose: 3000
          });
          return;
        }

        const validProducts = results.data.filter(product => 
          product.itemCode && 
          product.productName
        ).map(product => ({
          itemCode: product.itemCode,
          productName: product.productName,
          drawingCode: product.drawingCode || '',
          revision: product.revision || ''
        }));

        if (validProducts.length === 0) {
          toast.error('No valid products found in CSV', {
            position: "bottom-right",
            autoClose: 3000
          });
          return;
        }

        setProductList([...productList, ...validProducts]);
        toast.success(`${validProducts.length} products imported successfully`, {
          position: "bottom-right",
          autoClose: 3000
        });
      },
      error: (error) => {
        toast.error(`Error reading CSV file: ${error.message}`, {
          position: "bottom-right",
          autoClose: 3000
        });
      }
    });

    // Reset file input
    event.target.value = '';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <ParticlesBackground />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom component="div" sx={{ color: 'primary.main', mb: 4 }}>
          Configuration Panel
        </Typography>

        <Paper sx={{ width: '100%', mb: 2, backgroundColor: 'rgba(240,248,255,0.85)' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Product Management" />
            <Tab label="Initial Page Information" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Product Management</Typography>
              <TableContainer sx={{ backgroundColor: 'transparent' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item Code</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Drawing Code</TableCell>
                      <TableCell>Revision</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productList.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            value={product.itemCode}
                            onChange={(e) => handleProductChange(index, 'itemCode', e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={product.productName}
                            onChange={(e) => handleProductChange(index, 'productName', e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={product.drawingCode}
                            onChange={(e) => handleProductChange(index, 'drawingCode', e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={product.revision}
                            onChange={(e) => handleProductChange(index, 'revision', e.target.value)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => {
                            const updated = [...productList];
                            updated.splice(index, 1);
                            setProductList(updated);
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  onClick={handleSaveProducts}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setProductList([...productList, { itemCode: '', productName: '', drawingCode: '', revision: '' }])}
                  disabled={isLoading}
                >
                  Add Product
                </Button>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={isLoading}
                >
                  Import CSV
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={handleFileUpload}
                  />
                </Button>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Initial Page Information</Typography>
              <Grid container spacing={3}>
                {/* Home Section */}
                <MuiGrid item xs={12}>
                  <Card sx={{ backgroundColor: 'rgba(240,248,255,0.85)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Home Section</Typography>
                      <TextField
                        fullWidth
                        label="Header Title"
                        value={pageContent.home.headerTitle}
                        onChange={(e) => handleContentChange('home', 'headerTitle', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="subtitle1" gutterBottom>Typewriter Words</Typography>
                      {pageContent.home.typewriterWords.map((word, index) => (
                        <TextField
                          key={index}
                          fullWidth
                          label={`Word ${index + 1}`}
                          value={word}
                          onChange={(e) => {
                            const newWords = [...pageContent.home.typewriterWords];
                            newWords[index] = e.target.value;
                            handleContentChange('home', 'typewriterWords', newWords);
                          }}
                          sx={{ mb: 2 }}
                        />
                      ))}
                      <Typography variant="subtitle1" gutterBottom>Services</Typography>
                      <TextField
                        fullWidth
                        label="Services Title"
                        value={pageContent.home.services.title}
                        onChange={(e) => handleContentChange('home', 'services', {
                          ...pageContent.home.services,
                          title: e.target.value
                        })}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Services Description"
                        value={pageContent.home.services.description}
                        onChange={(e) => handleContentChange('home', 'services', {
                          ...pageContent.home.services,
                          description: e.target.value
                        })}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="subtitle1" gutterBottom>CTA Buttons</Typography>
                      <TextField
                        fullWidth
                        label="Login Button Text"
                        value={pageContent.home.ctaButtons.login}
                        onChange={(e) => handleContentChange('home', 'ctaButtons', {
                          ...pageContent.home.ctaButtons,
                          login: e.target.value
                        })}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Signup Button Text"
                        value={pageContent.home.ctaButtons.signup}
                        onChange={(e) => handleContentChange('home', 'ctaButtons', {
                          ...pageContent.home.ctaButtons,
                          signup: e.target.value
                        })}
                        sx={{ mb: 2 }}
                      />
                    </CardContent>
                  </Card>
                </MuiGrid>

                {/* About Section */}
                <MuiGrid item xs={12}>
                  <Card sx={{ backgroundColor: 'rgba(240,248,255,0.85)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>About Section</Typography>
                      <TextField
                        fullWidth
                        label="Title"
                        value={pageContent.about.title}
                        onChange={(e) => handleContentChange('about', 'title', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="subtitle1" gutterBottom>Paragraphs</Typography>
                      {pageContent.about.paragraphs.map((paragraph, index) => (
                        <TextField
                          key={index}
                          fullWidth
                          multiline
                          rows={4}
                          label={`Paragraph ${index + 1}`}
                          value={paragraph}
                          onChange={(e) => {
                            const newParagraphs = [...pageContent.about.paragraphs];
                            newParagraphs[index] = e.target.value;
                            handleContentChange('about', 'paragraphs', newParagraphs);
                          }}
                          sx={{ mb: 2 }}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </MuiGrid>

                {/* Contact Section */}
                <MuiGrid item xs={12}>
                  <Card sx={{ backgroundColor: 'rgba(240,248,255,0.85)' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Contact Section</Typography>
                      <TextField
                        fullWidth
                        label="Title"
                        value={pageContent.contact.title}
                        onChange={(e) => handleContentChange('contact', 'title', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Introduction"
                        value={pageContent.contact.introduction}
                        onChange={(e) => handleContentChange('contact', 'introduction', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Address"
                        value={pageContent.contact.address}
                        onChange={(e) => handleContentChange('contact', 'address', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Email"
                        value={pageContent.contact.email}
                        onChange={(e) => handleContentChange('contact', 'email', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Telephone"
                        value={pageContent.contact.telephone}
                        onChange={(e) => handleContentChange('contact', 'telephone', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        fullWidth
                        label="Google Maps Embed URL"
                        value={pageContent.contact.googleMapEmbedUrl}
                        onChange={(e) => handleContentChange('contact', 'googleMapEmbedUrl', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    </CardContent>
                  </Card>
                </MuiGrid>

                {/* Save Button */}
                <MuiGrid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleSaveContent}
                    disabled={isLoading}
                    sx={{ mt: 2 }}
                  >
                    {isLoading ? (
                      <>
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        Saving Changes...
                      </>
                    ) : (
                      'Save All Changes'
                    )}
                  </Button>
                </MuiGrid>
              </Grid>
            </Box>
          </TabPanel>
        </Paper>
      </Box>

      {/* Loading Backdrop with adjusted z-index */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 2  // Increased z-index
        }}
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <ToastContainer
        key={toastContainerKey}
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </motion.div>
  );
}

export default Config;
