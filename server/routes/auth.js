import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { dbFallback } from '../utils/dbFallback.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'vintagesecret';
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Register user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    if (isMongoConnected()) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        email,
        password: hashedPassword
      });
      const savedUser = await newUser.save();

      const token = jwt.sign(
        { id: savedUser._id, username: savedUser.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: { id: savedUser._id, username: savedUser.username, email: savedUser.email }
      });
    } else {
      // Local fallback
      const result = await dbFallback.registerUser(username, email, password);
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      res.status(201).json(result);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration', error: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide all required credentials' });
    }

    if (isMongoConnected()) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user._id, username: user.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email }
      });
    } else {
      // Local fallback
      const result = await dbFallback.loginUser(email, password);
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// Get user profile info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User profile not found' });
      }
      res.json(user);
    } else {
      const user = await dbFallback.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User profile not found' });
      }
      res.json(user);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error retrieving profile', error: err.message });
  }
});

// Update user profile info
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, profilePic, firstName, lastName, shippingAddress, city, postalCode, country, currentPassword, newPassword } = req.body;
    
    if (isMongoConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User profile not found' });
      }

      // If user is trying to change password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password is required to set a new password' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Incorrect current password' });
        }
        user.password = await bcrypt.hash(newPassword, 10);
      }

      if (username) user.username = username;
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
        }
        user.email = email;
      }
      
      // Update profile picture
      if (profilePic !== undefined) user.profilePic = profilePic;

      // Update shipping details
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (shippingAddress !== undefined) user.shippingAddress = shippingAddress;
      if (city !== undefined) user.city = city;
      if (postalCode !== undefined) user.postalCode = postalCode;
      if (country !== undefined) user.country = country;

      await user.save();

      // Return updated user data (without password)
      const userObj = user.toObject();
      delete userObj.password;
      res.json(userObj);
    } else {
      // Local fallback
      const result = await dbFallback.updateUser(req.user.id, {
        username,
        email,
        profilePic,
        firstName,
        lastName,
        shippingAddress,
        city,
        postalCode,
        country,
        currentPassword,
        newPassword
      });
      if (result.error) {
        return res.status(400).json({ message: result.error });
      }
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error updating profile', error: err.message });
  }
});

export default router;
