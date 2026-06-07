const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const WeakTopic = require('../models/WeakTopic');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate roadmap for a user
router.get('/:userId', async (req, res) => {
  try {
    // Get weak topics from database
    const weakTopics = await WeakTopic.find({
      userId: req.params.userId,
      isWeak: true
    });

    if (weakTopics.length === 0) {
      return res.json({ 
        message: 'No weak topics found!',
        roadmap: null 
      });
    }

    // Format weak topics for Gemini
    const topicList = weakTopics
      .map(t => `${t.subject} - ${t.topic} (score: ${t.score}%)`)
      .join('\n');

    // Create prompt for Gemini
    const prompt = `
      You are a helpful study coach for students.
      
      This student has the following weak topics:
      ${topicList}
      
      Create a simple 7-day study plan to help them improve.
      For each day provide:
      - Day number
      - Topic to study
      - One simple activity or exercise
      
      Keep it encouraging and simple.
      Format the response as JSON like this:
      {
        "days": [
          {
            "day": 1,
            "topic": "topic name",
            "activity": "what to do"
          }
        ]
      }
      Return only JSON, no extra text.
    `;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    const cleanText = text.replace(/```json|```/g, '').trim();
    const roadmap = JSON.parse(cleanText);

    res.json({ roadmap });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;