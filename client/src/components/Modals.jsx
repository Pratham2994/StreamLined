import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  Button, MenuItem, Snackbar, Alert, CircularProgress
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
    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Login failed.");
        return;
      }
  
      const data = await response.json();
      localStorage.setItem("token", data.token);
      setUser({ role: data.role, email });
  
      if (data.role === "admin") navigate("/admin");
      else if (data.role === "customer") navigate("/customer");
      else if (data.role === "noter") navigate("/noter");
  
      onClose();
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose}>
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
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleLogin} variant="contained">Login</Button>
      </DialogActions>
    </Dialog>
  );
}

function SignupModal({ open, onClose }) {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setRole('');
      setEmail('');
      setPassword('');
      setOtp('');
      setError('');
      setIsOtpSent(false);
      setOtpLoading(false);
    }
  }, [open]);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
    return passwordRegex.test(password);
  };

  const handleSendOtp = async () => {
    if (!role || !email || !password) {
      setError("Role, email, and password are all required.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isValidPassword(password)) {
      setError(
        "Password must be at least 6 characters long, contain one uppercase letter, one lowercase letter, and one special character."
      );
      return;
    }
    setOtpLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/users/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, role }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Failed to send OTP.");
        setOtpLoading(false);
        return;
      }
  
      setOtpLoading(false);
      setIsOtpSent(true);
      setError("");
    } catch (err) {
      setError("An unexpected error occurred.");
      setOtpLoading(false);
    }
  };
  
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:3000/api/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "OTP verification failed.");
        return;
      }
  
      setSnackbarOpen(true);
      setTimeout(() => {
        setSnackbarOpen(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError("An unexpected error occurred.");
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
          sx: { backgroundColor: "#fff", borderRadius: "10px", boxShadow: 3 }
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
            helperText={!role && Boolean(error) ? "Please select a role." : ""}
          >
            {["customer", "noter"].map((option) => (
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
            helperText={!isValidEmail(email) && email ? "Invalid email format." : ""}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="dense"
            error={Boolean(error) && password.length > 0 && password.length < 6}
            helperText={password && password.length < 6 ? "Minimum 6 characters required." : ""}
          />

          {isOtpSent && (
            <TextField
              label="Enter OTP"
              type="text"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              margin="dense"
              error={Boolean(error) && !otp}
              helperText={!otp ? "Please enter the OTP sent to your email." : ""}
            />
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          {!isOtpSent ? (
            otpLoading ? (
              <Button variant="contained" disabled sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" /> Sending OTP...
              </Button>
            ) : (
              <Button
                onClick={handleSendOtp}
                variant="contained"
                sx={{ backgroundColor: "#2980b9", ":hover": { backgroundColor: "#2471A3" } }}
              >
                Send OTP
              </Button>
            )
          ) : (
            <Button
              onClick={handleVerifyOtp}
              variant="contained"
              sx={{ backgroundColor: "#27ae60", ":hover": { backgroundColor: "#219150" } }}
            >
              Verify OTP
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Signup successful! Please login.
        </Alert>
      </Snackbar>
    </>
  );
}
export { LoginModal, SignupModal };
