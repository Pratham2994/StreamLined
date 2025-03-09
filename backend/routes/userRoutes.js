import express from 'express';
import { signup, login,updateUserRole, profile, sendOtp, verifyOtp, logout,} from '../controllers/userController.js'; 
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Existing routes...
router.post('/signup', signup);
router.put('/update-role', updateUserRole);

router.post('/login', login);
router.get('/profile', authenticateToken, profile);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// New logout route
router.post('/logout', logout);






export default router;
