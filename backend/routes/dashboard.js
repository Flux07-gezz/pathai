const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const jwt = require('jsonwebtoken');

// Verification middleware to parse the safe token signature
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authorization denied. No token.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized metrics fetch' });
  }
};

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    // Look up or establish a fallback baseline profile for this active user account
    let profile = await Progress.findOne({ userId: req.userId });
    
    if (!profile) {
      profile = new Progress({ userId: req.userId, quizzesTaken: [], weakTopics: [] });
      await profile.save();
    }

    // Dynamic metrics mathematical synthesis
    const totalQuizzes = profile.quizzesTaken.length;
    
    const averageScore = totalQuizzes > 0
      ? Math.round(profile.quizzesTaken.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions * 100), 0) / totalQuizzes)
      : 0;

    // Default target completion placeholder for a 7-day milestone structure
    const roadmapCompletionPercent = Math.round((profile.completedRoadmapDays?.length || 0) / 7 * 100);

    // Return exact statistical payloads to overwrite the dashboard
    res.json({
      totalQuizzes,
      averageScore,
      roadmapCompletionPercent: Math.min(roadmapCompletionPercent, 100),
      weakTopicsCount: profile.weakTopics.length,
      weakTopicsList: profile.weakTopics,
      recentActivity: profile.quizzesTaken.slice(-3).reverse() // send back last 3 items
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to aggregate metrics profile', error: error.message });
  }
});

module.exports = router;