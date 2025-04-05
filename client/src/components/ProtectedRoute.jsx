// src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CircularProgress, Box, Typography, useTheme } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);
  const theme = useTheme();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          width: '100%',
          px: { xs: 2, sm: 3 },
          py: { xs: 4, sm: 5 }
        }}
      >
        <CircularProgress 
          size={40}
          sx={{ 
            width: { xs: 40, sm: 50 }, 
            height: { xs: 40, sm: 50 } 
          }}
        />
        <Typography 
          variant="body1" 
          sx={{ 
            mt: { xs: 1.5, sm: 2 },
            textAlign: 'center',
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          Please wait...
        </Typography>
      </Box>
    );
  }

  // If no user is authenticated or doesn't have required role, redirect to landing page
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has the required role
  return children;
};

export default ProtectedRoute;
