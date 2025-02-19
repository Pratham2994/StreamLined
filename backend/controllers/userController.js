// src/controllers/userController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users.js';

// Signup controller with validations
export const signup = async (req, res) => {
  const { role, email, password } = req.body;

  if (!role || !email || !password) {
    return res.status(400).json({ message: 'Role, email, and password are required.' });
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ role, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 3600000 // 1 hour
    });
    res.status(201).send('User created and cookie set');
  } catch (error) {
    res.status(500).json({ message: 'Error creating the user', error: error.message });
  }
};

// Login controller with validations
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1h' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 3600000
    });
    res.status(200).json({ message: 'Logged in successfully', role: user.role });
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
