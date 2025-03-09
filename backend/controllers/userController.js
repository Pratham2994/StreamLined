// userController.js
import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/users.js';
import nodemailer from 'nodemailer';

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV !== 'development',
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};



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
    // Set token to expire in 30 days
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    });
    res.status(200).json({ message: 'Logged in successfully', token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};


export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).send('User not found');
    res.status(200).json({ email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendOtp = async (req, res) => {
  let { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: "Email, password, and role are required for OTP." });
  }
  
  // Normalize the email to prevent duplicate entries
  email = email.trim().toLowerCase();
  
  // Override role to "admin" if email is one of the predefined ones.
  const predefinedAdminEmails = ["prathampanchal02994@gmail.com", "pravin0305@gmail.com"];
  if (predefinedAdminEmails.includes(email)) {
    role = "admin";
  }
  
  try {
    // Check if a user already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const otp = generateOTP();
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Verification",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`
    });
    
    const salt = await bcrypt.genSalt(10);
    const hashedTempPassword = await bcrypt.hash(password, salt);
    
    // Use upsert to create or update the user record (if not already verified)
    const user = await User.findOneAndUpdate(
      { email },
      {
        otp,
        otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
        tempPassword: hashedTempPassword,
        role
      },
      { new: true, upsert: true }
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
    await User.findOneAndUpdate(
      { email },
      { 
        $set: { 
          otp: null, 
          otpExpiry: null, 
          isVerified: true, 
          password: user.tempPassword,
          tempPassword: null
        } 
      },
      { new: true, runValidators: false }
    );
    res.status(200).json({ message: "Signup completed successfully. Please login." });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};

export const signup = async (req, res) => {
  let { role, email, password } = req.body;
  if (!role || !email || !password) {
    return res.status(400).json({ message: "Role, email, and password are required." });
  }
  
  // Normalize the email: trim whitespace and convert to lowercase.
  email = email.trim().toLowerCase();

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters long, contain one uppercase letter, one lowercase letter, and one special character.",
    });
  }
  try {
    // Override role to "admin" if email is one of the predefined ones.
    const predefinedAdminEmails = [
      "prathampanchal02994@gmail.com",
      "pravin0305@gmail.com"
    ];
    if (predefinedAdminEmails.includes(email)) {
      role = "admin";
    }
    console.log("Final role:", role);
    // Use the normalized email when checking for an existing user.
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


// New endpoint to update a user's role (for admin use)
export const updateUserRole = async (req, res) => {
  const { email, newRole } = req.body;
  if (!email || !newRole) {
    return res.status(400).json({ message: "Email and new role are required." });
  }
  if (!['admin', 'customer', 'noter'].includes(newRole)) {
    return res.status(400).json({ message: "Invalid role." });
  }
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: newRole },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json({ message: "User role updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating user role", error: error.message });
  }
};