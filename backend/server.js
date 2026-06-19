const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// console.log('MONGO_URI:', process.env.MONGO_URI);

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log('MongoDB connected successfully!'))
  .catch((err) => console.log('MongoDB connection error:', err.message));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const quizRoutes = require('./routes/quiz');
app.use('/api/quiz', quizRoutes);

const roadmapRoutes = require('./routes/roadmap');
app.use('/api/roadmap', roadmapRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('PathAI backend is running!');
});

const PORT = process.env.PORT || 5000;

// Force the server to listen specifically on the local IPv4 interface
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running explicitly on http://127.0.0.1:${PORT}`);
});