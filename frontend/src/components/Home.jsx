// src/components/Home.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4">Welcome to Prarthna Manufacturing</Typography>
        <Typography variant="body1">This is the home page.</Typography>
      </Box>
    </motion.div>
  );
}

export default Home;
