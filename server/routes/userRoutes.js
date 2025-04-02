import express from 'express';
import { signup, login, updateUserRole, profile, sendOtp, verifyOtp, logout } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Test email endpoint
router.get('/test-email', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();
    console.log('Email configuration is valid');

    await transporter.sendMail({
      from: `"Tracker System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E86C1;">Test Email</h2>
          <p>This is a test email to verify the email configuration.</p>
          <p>If you receive this email, the email system is working correctly.</p>
        </div>
      `
    });

    res.json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error('Email test failed:', error);
    res.status(500).json({ 
      message: "Email test failed", 
      error: error.message,
      details: error 
    });
  }
});

// Existing routes...
router.post('/signup', signup);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/profile', authenticateToken, profile);
router.post('/logout', logout);
router.put('/update-role', authenticateToken, updateUserRole);

export default router;
