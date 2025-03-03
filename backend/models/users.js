import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['admin', 'customer', 'noter'],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'is invalid']
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String,  // Store OTP as a string
    default: null
  },
  otpExpiry: {
    type: Date,  // Store the expiration time of the OTP
    default: null
  },
  isVerified: {
    type: Boolean, // Track if the user has verified their email
    default: false
  }
}, {
  timestamps: true 
});

const User = mongoose.model('User', userSchema);

export default User;
