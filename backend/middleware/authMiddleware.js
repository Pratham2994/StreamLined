// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send('Unauthorized');

  try {
    const decoded = jwt.verify(token, 'your_secret_key'); // Consider moving the secret to an env variable
    req.user = decoded; // decoded should include the user id
    next();
  } catch (error) {
    res.status(401).send('Invalid token');
  }
};
