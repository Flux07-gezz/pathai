const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware to verify JWT signatures
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token formatting invalid' });
    }
    
    // Decodes token payload using your environment secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    // This logs the precise validation roadblock directly into your server console terminal window
    console.log("❌ JWT Verification Failed Reason:", err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentClass: user.studentClass // Passed to track onboarding layout redirection
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Student Class level configuration route during onboarding setup
router.put('/update-class', protect, async (req, res) => {
  try {
    const { studentClass } = req.body;

    // Validate if the chosen class fits within our NCERT list
    const validClasses = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
    if (!validClasses.includes(studentClass)) {
      return res.status(400).json({ message: 'Invalid NCERT class selection' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { studentClass },
      { returnDocument: 'after' }
    ).select('-password');

    res.json({ message: 'Class level set successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST: Update Student Profile Attributes
router.post('/update-profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { studentClass } = req.body;
    await User.findByIdAndUpdate(decoded.userId, { studentClass });
    
    res.json({ success: true, message: 'Class value configured.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating dashboard configurations' });
  }
});

module.exports = router;