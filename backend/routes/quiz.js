const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const QuizScore = require('../models/QuizScore');
const WeakTopic = require('../models/WeakTopic');

// Get weak topics for a user
router.get('/weak/:userId', async (req, res) => {
  try {
    const weakTopics = await WeakTopic.find({ 
      userId: req.params.userId,
      isWeak: true 
    });
    res.json(weakTopics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get questions by subject
router.get('/:subject', async (req, res) => {
  try {
    const questions = await Question.find({ 
      subject: req.params.subject 
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit quiz results
router.post('/submit', async (req, res) => {
  try {
    const { userId, subject, topicScores, totalScore } = req.body;

    // Save quiz score
    const quizScore = new QuizScore({
      userId,
      subject,
      topicScores,
      totalScore
    });
    await quizScore.save();

    // Detect weak topics
    for (let topic in topicScores) {
      const score = topicScores[topic];
      
      await WeakTopic.findOneAndUpdate(
        { userId, subject, topic },
        { 
          userId,
          subject,
          topic,
          score,
          isWeak: score < 50
        },
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Quiz submitted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



module.exports = router;