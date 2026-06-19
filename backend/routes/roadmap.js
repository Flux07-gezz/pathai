const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Progress = require('../models/Progress'); 
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Custom Authentication Middleware
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// ── GET: Fetch Saved Roadmap or Generate a New One if Missing ──
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User profile not found' });
    const studentClass = user.studentClass || 'Class 10';

    let profile = await Progress.findOne({ userId: req.user.id });
    if (!profile) {
      profile = new Progress({ userId: req.user.id, quizzesTaken: [], weakTopics: [] });
      await profile.save();
    }

    // 1. PERSISTENCE CHECK: If a roadmap is already active in DB, return it immediately!
    if (profile.activeRoadmap && profile.activeRoadmap.days && profile.activeRoadmap.days.length > 0) {
      return res.json({ success: true, roadmap: profile.activeRoadmap });
    }

    // 2. FALLBACK: If no roadmap exists and they have no weak topics yet
    if (!profile.weakTopics || profile.weakTopics.length === 0) {
      return res.json({ 
        message: 'Excellent! No weak topics found yet. Complete an AI quiz with a score below 70% to initialize your dynamic roadmap path!',
        roadmap: null 
      });
    }

    // 3. Format weak items for engine context injection
    const topicList = profile.weakTopics.map(topic => `- Topic: "${topic}"`).join('\n');

    const prompt = `
      You are an elite academic coach specialized in the CBSE/NCERT curriculum framework for Indian schools.
      Target Audience: A student enrolled in ${studentClass}.
      Struggling with: \n${topicList}
      
      Generate a practical, structured 7-day micro-study schedule. Ensure every single task maps directly to standard NCERT textbooks for ${studentClass}.
      Return ONLY a valid JSON object matching the exact schema below. Do not wrap it in markdown block quotes:
      {
        "days": [
          {
            "day": 1,
            "topic": "Name of specific concept being targeted",
            "activity": "Clear action or textbook assignment to solve"
          }
        ]
      }
    `;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: "application/json" } 
    });
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json|```/g, '').trim();
    const roadmapData = JSON.parse(cleanText);

    // 4. SAVE TO DATABASE: Store the newly minted roadmap structure right into the user profile
    profile.activeRoadmap = roadmapData;
    await profile.save();

    res.json({ success: true, roadmap: roadmapData });

  } catch (error) {
    console.error('Roadmap processing error:', error.message);
    res.status(500).json({ message: 'Server error parsing AI customized roadmap', error: error.message });
  }
});

// ── POST: Update Completed Days Status in Database ──
router.post('/toggle-day', protect, async (req, res) => {
  try {
    const { dayNum } = req.body;
    
    let profile = await Progress.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Progress profile not found' });

    // Initialize tracking field array if it doesn't exist
    if (!profile.completedRoadmapDays) {
      profile.completedRoadmapDays = [];
    }

    const index = profile.completedRoadmapDays.indexOf(dayNum);
    if (index > -1) {
      profile.completedRoadmapDays.splice(index, 1); // Uncheck: remove day
    } else {
      profile.completedRoadmapDays.push(dayNum); // Check: add day
    }

    await profile.save();
    res.json({ success: true, completedDays: profile.completedRoadmapDays });
  } catch (error) {
    res.status(500).json({ message: 'Failed to sync checkpoint milestone status', error: error.message });
  }
});

// ── POST: Clear/Reset Current Roadmap to Generate a Brand New One ──
router.post('/reset', protect, async (req, res) => {
  try {
    let profile = await Progress.findOne({ userId: req.user.id });
    if (profile) {
      profile.activeRoadmap = undefined; // Clears the saved object structure
      profile.completedRoadmapDays = [];  // Resets checking index arrays
      await profile.save();
    }
    res.json({ success: true, message: 'Active roadmap workspace flushed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear roadmap workspace', error: error.message });
  }
});

module.exports = router;