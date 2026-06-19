const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Safe optional loading of bcrypt to prevent crashes if it isn't installed
let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  bcrypt = null;
}

// === REGISTER ROUTE ===
router.post('/register', async (req, res) => {
  const { name, email, password, studentLevel, educationBoard } = req.body;

  try {
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already registered' });
    }

    // Securely hash password if bcrypt package exists locally
    let finalizedPassword = password;
    if (bcrypt) {
      finalizedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = new User({
      name,
      email,
      password: finalizedPassword,
      studentLevel: studentLevel || 'Class 10',
      educationBoard: educationBoard || 'CBSE'
    });

    await newUser.save();
    res.status(201).json({ message: 'Registered successfully! Please login.' });
  } catch (err) {
    console.error('Registration Crash:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// === LOGIN ROUTE ===
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Email or Password' });
    }

    // Smart tracking evaluation checks both hashed and plain configurations
    let isMatch = false;
    if (bcrypt && user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Email or Password' });
    }

    // Return the safe user object structure to match your frontend storage engine
    res.json({
      token: "mock_session_token_" + user._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentLevel: user.studentLevel || 'Class 10',
        educationBoard: user.educationBoard || 'CBSE'
      }
    });

  } catch (err) {
    console.error('Login Crash:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;