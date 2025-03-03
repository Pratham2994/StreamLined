// src/controllers/userController.js

import dotenv from 'dotenv';
dotenv.config();
// Signup controller with validations
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/users.js';
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development',
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};


export const signup = async (req, res) => {
  const { role, email, password } = req.body;

  if (!role || !email || !password) {
    return res.status(400).json({ message: "Role, email, and password are required." });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  // 🔹 Enhanced Password Validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters long, contain one uppercase letter, one lowercase letter, and one special character.",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ role, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });

    res.status(201).json({ message: "User created successfully", token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Error creating the user", error: error.message });
  }
};


// ✅ Fixed Login Controller
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // FIX: Corrected JWT assignment
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set cookie with JWT
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 3600000
    });

    res.status(200).json({ message: 'Logged in successfully', token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Profile controller (Protected Route)
export const profile = async (req, res) => {
  try {
    // req.user is set by the authenticateToken middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).send('User not found');
    res.status(200).json({ email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};
import nodemailer from 'nodemailer';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
export const sendOtp = async (req, res) => {
  const { email, password, role } = req.body;

  try {
      const otp = generateOTP();

      await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your OTP for Verification",
          text: `Your OTP is ${otp}. It will expire in 5 minutes.`
      });

      // Store OTP + Password + Role (temporarily)
      const user = await User.findOneAndUpdate(
          { email },
          {
              otp,
              otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
              password, // Store password temporarily
              role      // Store role temporarily
          },
          { new: true, upsert: true } // Upsert to create if user doesn't exist
      );

      if (!user) {
          return res.status(500).json({ message: "Failed to update user with OTP" });
      }

      res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
      res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(400).json({ message: "User not found" });
      }

      if (user.otp !== otp || user.otpExpiry < new Date()) {
          return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // 🔹 Hash password before saving permanently
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      // 🔹 Store user data permanently
      await User.findOneAndUpdate(
          { email },
          { 
              $set: { 
                  otp: null, 
                  otpExpiry: null, 
                  isVerified: true, 
                  password: hashedPassword 
              } 
          },
          { new: true, runValidators: false } // 🔥 Prevents validation errors
      );

      res.status(200).json({ message: "Signup completed successfully. Please login." });

  } catch (error) {
      res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};
