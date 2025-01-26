// userController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users.js'; // Adjust path as necessary

// Signup controller
export const signup = async (req, res) => {
  const { role, email, password } = req.body;
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
        httpOnly: true, // The cookie is not accessible via JavaScript (XSS protection)
        secure: process.env.NODE_ENV !== 'development', // The cookie is sent over HTTPS
        sameSite: 'strict', // The cookie is not sent with cross-origin requests (CSRF protection)
        maxAge: 3600000 // 1 hour
    });
    res.status(201).send('User created and cookie set');
  } catch (error) {
    res.status(500).json({ message: 'Error creating the user', error: error.message });
  }
};

// Login controller
export const login = async (req, res) => {
  const { email, password } = req.body;

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
    res.status(200).send('Logged in and cookie set');
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};
