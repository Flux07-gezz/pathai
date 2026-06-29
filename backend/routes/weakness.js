const express = require('express');
const router = express.Router();
const WeakTopic = require('../models/WeakTopic');

// Get all weak topics grouped by subject
router.get('/:userId', async (req, res) => {
  try {
    const weakTopics = await WeakTopic.find({
      userId: req.params.userId,
      isWeak: true,
      isStrength: false
    }).sort({ score: 1 });

    // Group by subject
    const grouped = {};
    weakTopics.forEach(topic => {
      if (!grouped[topic.subject]) {
        grouped[topic.subject] = [];
      }
      grouped[topic.subject].push(topic);
    });

    const totalWeak = weakTopics.length;

    res.json({ grouped, totalWeak });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get strengths (improved topics)
router.get('/strengths/:userId', async (req, res) => {
  try {
    const strengths = await WeakTopic.find({
      userId: req.params.userId,
      isStrength: true
    }).sort({ updatedAt: -1 });

    res.json(strengths);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Manually mark topic as strength
router.put('/mark-strength/:topicId', async (req, res) => {
  try {
    const topic = await WeakTopic.findByIdAndUpdate(
      req.params.topicId,
      {
        isWeak: false,
        isStrength: true,
        markedStrengthManually: true
      },
      { new: true }
    );

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    res.json({ message: 'Marked as strength!', topic });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;