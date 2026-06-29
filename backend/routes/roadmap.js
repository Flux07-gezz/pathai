const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const WeakTopic = require('../models/WeakTopic');
const Roadmap = require('../models/Roadmap');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Check if two subjects are related using Gemini
async function areSubjectsRelated(subject1, subject2) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    Are "${subject1}" and "${subject2}" related academic subjects?
    Answer with ONLY "yes" or "no". Nothing else.
  `;
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim().toLowerCase();
  return text.includes('yes');
}

// Generate roadmap using Gemini
async function generateRoadmapWithGemini(weakTopics) {
  const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
  const topicList = weakTopics
    .map(t => `${t.subject} - ${t.topic} (score: ${t.score}%)`)
    .join('\n');

  const prompt = `
    You are a helpful study coach for students.
    
    This student has the following weak topics:
    ${topicList}
    
    Create a simple 7-day study plan to help them improve.
    Return ONLY a JSON object like this, no extra text:
    {
      "days": [
        {
          "day": 1,
          "topic": "topic name",
          "activity": "what to do today"
        }
      ]
    }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// Get all roadmaps for a user (active + archived)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const activeRoadmaps = await Roadmap.find({
      userId, status: 'active'
    }).sort({ createdAt: -1 });

    const archivedRoadmaps = await Roadmap.find({
      userId, status: { $in: ['completed', 'archived'] }
    })
    .sort({ completedAt: -1 })
    .limit(5);

    res.json({ activeRoadmaps, archivedRoadmaps });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate a new roadmap
router.post('/generate', async (req, res) => {
  try {
    const { userId, subject } = req.body;

    // Step 1 — check active roadmaps count
    const activeRoadmaps = await Roadmap.find({ userId, status: 'active' });

    if (activeRoadmaps.length >= 5) {
      return res.status(400).json({
        message: 'limit_reached',
        info: 'You have 5 active roadmaps. Please complete at least one before generating a new one.'
      });
    }

    // Step 2 — check if subject is related to any existing active roadmap
    for (let roadmap of activeRoadmaps) {
      if (roadmap.subject === subject) {
        return res.status(400).json({
          message: 'already_exists',
          info: `You already have an active roadmap for ${subject}. Complete it first!`,
          existingRoadmap: roadmap
        });
      }

      // Ask Gemini if subjects are related
      const related = await areSubjectsRelated(subject, roadmap.subject);
      if (related) {
        return res.status(400).json({
          message: 'related_subject',
          info: `${subject} is related to your existing ${roadmap.subject} roadmap. Complete that first before starting a new one!`,
          existingRoadmap: roadmap
        });
      }
    }

    // Step 3 — get weak topics for this subject
    const weakTopics = await WeakTopic.find({
      userId,
      isWeak: true
    });

    if (weakTopics.length === 0) {
      return res.status(400).json({
        message: 'no_weak_topics',
        info: 'No weak topics found! Take a quiz first to generate a roadmap.'
      });
    }

    // Step 4 — generate roadmap with Gemini
    const generated = await generateRoadmapWithGemini(weakTopics);

    // Step 5 — save to MongoDB
    const roadmap = new Roadmap({
      userId,
      subject,
      weakTopics: weakTopics.map(t => ({ topic: t.topic, score: t.score })),
      days: generated.days,
      status: 'active'
    });

    await roadmap.save();

    res.json({ message: 'Roadmap generated!', roadmap });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark roadmap as completed
router.put('/complete/:roadmapId', async (req, res) => {
  try {
    const roadmap = await Roadmap.findByIdAndUpdate(
      req.params.roadmapId,
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Keep only last 5 in archive — if more than 5, archive oldest
    const completedRoadmaps = await Roadmap.find({
      userId: roadmap.userId,
      status: { $in: ['completed', 'archived'] }
    }).sort({ completedAt: 1 });

    if (completedRoadmaps.length > 5) {
      const toArchive = completedRoadmaps.slice(0, completedRoadmaps.length - 5);
      for (let r of toArchive) {
        await Roadmap.findByIdAndDelete(r._id);
      }
    }

    res.json({ message: 'Roadmap completed!', roadmap });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;