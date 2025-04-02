import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog, DialogTitle, DialogContent, TextField, DialogActions,
  Button, MenuItem, Snackbar, Alert, CircularProgress,
  InputAdornment, IconButton, Box, Typography, Divider,
  Paper, Avatar
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Import icons
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CancelIcon from '@mui/icons-material/Cancel';
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyIcon from '@mui/icons-material/Key';
import LogoutIcon from '@mui/icons-material/Logout';

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setEmail('');
      setPassword('');
      setError('');
      setShowPassword(false);
      setIsLoading(false);
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
    
    setIsLoading(true);
    
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
        setIsLoading(false);
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
      setIsLoading(false);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperComponent={motion.div}
      keepMounted={false}
      disableRestoreFocus
      PaperProps={{
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
        sx: { 
          borderRadius: '12px',
          overflow: 'hidden',
          maxWidth: '400px',
          width: '100%',
          bgcolor: '#ffffff'
        }
      }}
    >
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 1 }}>
          <LoginIcon />
        </Avatar>
        <Typography variant="h6" component="div">
          Welcome Back
        </Typography>
      </Box>
      
      <DialogContent sx={{ p: 3, pt: 3, bgcolor: '#ffffff' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Sign in to your account to access the platform
        </Typography>
        
        <TextField
          label="Email"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          error={Boolean(error) && !isValidEmail(email) && email.length > 0}
          helperText={!isValidEmail(email) && email.length > 0 ? 'Invalid email format.' : ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color={!isValidEmail(email) && email.length > 0 ? "error" : "action"} />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          error={Boolean(error) && password.length > 0 && password.length < 6}
          helperText={password.length > 0 && password.length < 6 ? 'Minimum 6 characters required.' : ''}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon color={password.length > 0 && password.length < 6 ? "error" : "action"} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mt: 2 }}
            icon={<CancelIcon fontSize="inherit" />}
          >
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'space-between', bgcolor: '#ffffff' }}>
        <Button 
          onClick={onClose}
          startIcon={<LogoutIcon />}
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleLogin} 
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? null : <LoginIcon />}
          sx={{ px: 3 }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SignupModal({ open, onClose }) {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setRole('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setOtp('');
      setError('');
      setIsOtpSent(false);
      setOtpLoading(false);
      setSignupLoading(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open]);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
    return passwordRegex.test(password);
  };
  
  const doPasswordsMatch = () => {
    return password === confirmPassword && confirmPassword !== '';
  };

  const handleSendOtp = async () => {
    if (!role) {
      setError("Please select a role.");
      return;
    }
    
    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    if (!password || !isValidPassword(password)) {
      setError(
        "Password must be at least 6 characters long, contain one uppercase letter, one lowercase letter, and one special character."
      );
      return;
    }
    
    if (!confirmPassword || !doPasswordsMatch()) {
      setError("Passwords do not match.");
      return;
    }
    
    setOtpLoading(true);
    setError("");
    
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
    
    setSignupLoading(true);
    setError("");
  
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
        setSignupLoading(false);
        return;
      }
  
      setSnackbarOpen(true);
      setTimeout(() => {
        setSnackbarOpen(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError("An unexpected error occurred.");
      setSignupLoading(false);
    }
  };
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        PaperComponent={motion.div}
        keepMounted={false}
        disableRestoreFocus
        PaperProps={{
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3 },
          sx: { 
            borderRadius: '12px',
            overflow: 'hidden',
            maxWidth: '450px',
            width: '100%',
            bgcolor: '#ffffff'
          }
        }}
      >
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 1 }}>
            <HowToRegIcon />
          </Avatar>
          <Typography variant="h6" component="div">
            {isOtpSent ? "Verify Your Account" : "Create New Account"}
          </Typography>
        </Box>

        <DialogContent sx={{ p: 3, pt: 3, bgcolor: '#ffffff' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
            {isOtpSent 
              ? "We've sent a verification code to your email address. Please enter it below." 
              : "Fill out the form below to create your account"}
          </Typography>

          {!isOtpSent ? (
            <>
              <TextField
                select
                label="Role"
                fullWidth
                value={role}
                onChange={(e) => setRole(e.target.value)}
                margin="normal"
                error={Boolean(error) && !role}
                helperText={Boolean(error) && !role ? "Please select a role." : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color={Boolean(error) && !role ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
              >
                {["customer", "noter","admin"].map((option) => (
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
                margin="normal"
                error={Boolean(error) && !isValidEmail(email) && email.length > 0}
                helperText={!isValidEmail(email) && email.length > 0 ? "Invalid email format." : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color={!isValidEmail(email) && email.length > 0 ? "error" : "action"} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                error={Boolean(error) && password.length > 0 && !isValidPassword(password)}
                helperText={
                  password.length > 0 && !isValidPassword(password)
                    ? "Password must contain uppercase, lowercase, special character, and be at least 6 characters."
                    : ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color={password.length > 0 && !isValidPassword(password) ? "error" : "action"} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                error={Boolean(error) && confirmPassword.length > 0 && !doPasswordsMatch()}
                helperText={confirmPassword.length > 0 && !doPasswordsMatch() ? "Passwords do not match." : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockResetIcon color={confirmPassword.length > 0 && !doPasswordsMatch() ? "error" : "action"} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleToggleConfirmPasswordVisibility}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  backgroundColor: 'rgba(33, 150, 243, 0.08)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <EmailIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  We've sent a verification code to <strong>{email}</strong>
                </Typography>
              </Paper>
              
              <TextField
                label="Enter OTP"
                type="text"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                margin="normal"
                placeholder="6-digit code"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ mt: 2 }}
              icon={<CancelIcon fontSize="inherit" />}
            >
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'space-between', bgcolor: '#ffffff' }}>
          <Button 
            onClick={onClose}
            startIcon={<LogoutIcon />}
            sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
          {!isOtpSent ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendOtp}
              disabled={otpLoading}
              startIcon={otpLoading ? null : <HowToRegIcon />}
            >
              {otpLoading ? <CircularProgress size={24} /> : "Sign Up & Get OTP"}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleVerifyOtp}
              disabled={signupLoading}
              startIcon={signupLoading ? null : <CheckCircleIcon />}
            >
              {signupLoading ? <CircularProgress size={24} /> : "Verify OTP"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Signup successful! You can now login.
        </Alert>
      </Snackbar>
    </>
  );
}

export { LoginModal, SignupModal };
