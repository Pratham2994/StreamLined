// src/components/Modals.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [open]);

  const handleLogin = async () => {
    // Client-side validations
    if (!email || !password) {
      setError('Both email and password are required.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const errorData = await response.text();
        setError(errorData || 'Login failed.');
        return;
      }
      const data = await response.json();
      // Update auth context (no localStorage usage)
      setUser({ role: data.role, email });
      // Redirect based on role
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'customer') navigate('/customer');
      else if (data.role === 'noter') navigate('/noter');
      onClose();
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperComponent={motion.div}
      PaperProps={{
        initial: { scale: 0.8 },
        animate: { scale: 1 },
        transition: { duration: 0.3 },
        sx: { backgroundColor: '#fff' } // fix for transparency
      }}
    >
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="dense"
          error={Boolean(error) && !isValidEmail(email)}
          helperText={!isValidEmail(email) && email ? 'Invalid email format.' : ''}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="dense"
          error={Boolean(error) && password.length > 0 && password.length < 6}
          helperText={password && password.length < 6 ? 'Minimum 6 characters required.' : ''}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleLogin} variant="contained">
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SignupModal({ open, onClose }) {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setRole('');
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [open]);

  const handleSignup = async () => {
    // Client-side validations
    if (!role || !email || !password) {
      setError('Role, email, and password are all required.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role, email, password })
      });
      if (!response.ok) {
        const errorData = await response.text();
        setError(errorData || 'Signup failed.');
        return;
      }
      setSnackbarOpen(true);
      setTimeout(() => {
        setSnackbarOpen(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        PaperComponent={motion.div}
        PaperProps={{
          initial: { scale: 0.8 },
          animate: { scale: 1 },
          transition: { duration: 0.3 },
          sx: { backgroundColor: '#fff' } // fix for transparency
        }}
      >
        <DialogTitle>Signup</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Role"
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value)}
            margin="dense"
            error={!role && Boolean(error)}
            helperText={!role && Boolean(error) ? 'Please select a role.' : ''}
          >
            {['admin', 'customer', 'noter'].map((option) => (
              <MenuItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="dense"
            error={Boolean(error) && !isValidEmail(email)}
            helperText={!isValidEmail(email) && email ? 'Invalid email format.' : ''}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="dense"
            error={Boolean(error) && password.length > 0 && password.length < 6}
            helperText={password && password.length < 6 ? 'Minimum 6 characters required.' : ''}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSignup} variant="contained">
            Signup
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Signup successful! Please login.
        </Alert>
      </Snackbar>
    </>
  );
}

export { LoginModal, SignupModal };
