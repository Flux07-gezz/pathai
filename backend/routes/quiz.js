const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const QuizScore = require('../models/QuizScore');
const WeakTopic = require('../models/WeakTopic');
const User = require('../models/User'); // Imported User model to check student class
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Custom Authentication Middleware to protect routes and append req.user
const protect = async (req, res, next) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Generate questions anchored to the user's specific NCERT grade
async function generateQuestionsWithGemini(topic, studentClass, count) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
    You are an expert tutor specialized in the Indian CBSE and NCERT curriculum frameworks.
    Target Academic Level: ${studentClass}
    Requested Topic/Chapter/Sub-topic: "${topic}"
    
    Generate exactly ${count} multiple choice quiz questions appropriate ONLY for the depth, complexity, mathematical formulations, and vocabulary definitions specified in the official NCERT textbooks for ${studentClass}. If the input represents a massive category or subject, pick a balanced set of conceptual fundamentals relevant to ${studentClass}.
    
    Return ONLY a valid JSON array, no markdown wrappers, no backticks:
    [
      {
        "question": "question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "correct option text exactly matching one entry from options array",
        "topic": "specific micro-topic or chapter name from NCERT textbook"
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('Gemini raw response:', text.substring(0, 200));
    
    // Safety processing to remove code block wrappers if Gemini still drops them in
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return parsed;
  } catch (err) {
    console.log('Gemini generation error:', err.message);
    throw err;
  }
}

// Get weak topics
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

// NEW POST ROUTE: Universal NCERT Search Engine Endpoint
router.post('/generate-dynamic', protect, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ message: 'Please provide a topic or chapter to study' });
    }

    const TOTAL_QUESTIONS = 5; 

    // 1. Discover the student's anchor class profile
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User profile not found' });
    
    const studentClass = user.studentClass || 'Class 10'; 

    console.log(`Processing NCERT Query: "${topic}" for level: ${studentClass}`);

    // 2. Query Gemini directly for dynamic customized items
    const generated = await generateQuestionsWithGemini(topic, studentClass, TOTAL_QUESTIONS);

    // 3. FIX: Map keys to match EXACTLY what your QuizPage.jsx uses!
    const toSave = generated.map((q, idx) => {
      // Find the correct index position of the answer string inside the options array
      const correctIdx = Array.isArray(q.options) ? q.options.indexOf(q.answer) : 0;
      
      return {
        questionText: q.question || q.questionText, // ✅ Matches frontend currentQuestion.questionText
        options: q.options,                         // ✅ Matches frontend currentQuestion.options
        correctOptionIndex: correctIdx >= 0 ? correctIdx : 0, // ✅ Matches frontend q.correctOptionIndex
        topic: q.topic || topic,
        subject: studentClass, 
        difficulty: 'Dynamic-NCERT',
        aiGenerated: true
      };
    });

    // 4. CRITICAL: Wrap the array inside an object with a 'questions' key and send it!
    res.json({ questions: toSave });

  } catch (error) {
    console.error("Backend Quiz Generation Error:", error);
    res.status(500).json({ message: 'Server error generating dynamic AI quiz', error: error.message });
  }
});

// Submit quiz results
router.post('/submit', async (req, res) => {
  try {
    const { userId, subject, topicScores, totalScore } = req.body;

    const quizScore = new QuizScore({
      userId,
      subject,
      topicScores,
      totalScore
    });
    await quizScore.save();

    for (let topic in topicScores) {
      const score = topicScores[topic];
      await WeakTopic.findOneAndUpdate(
        { userId, topic },
        { userId, subject, topic, score, isWeak: score < 60 }, // Set threshold to 60 for low connectivity targeted warnings
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Quiz submitted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const Progress = require('../models/Progress'); // Make sure this path points to your Progress model
const jwt = require('jsonwebtoken');

// Simple verification middleware if not already present in your quiz routes file
const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized session log request' });
  }
};

// POST /api/quiz/save-score
router.post('/save-score', protectRoute, async (req, res) => {
  try {
    const { topicName, score, totalQuestions } = req.body;

    // Determine if the performance reflects a weakness (e.g., scoring under 70%)
    const percentage = (score / totalQuestions) * 100;
    const isWeakArea = percentage < 70;

    let profile = await Progress.findOne({ userId: req.userId });
    if (!profile) {
      profile = new Progress({ userId: req.userId });
    }

    // 1. Push quiz run history details
    profile.quizzesTaken.push({
      topicName,
      score,
      totalQuestions
    });

    // 2. If it's a weak area and isn't already tracked, append it to weakTopics
    if (isWeakArea && !profile.weakTopics.includes(topicName)) {
      profile.weakTopics.push(topicName);
    } 
    // If they did great this time, safely remove it from their weakness tracker list!
    else if (!isWeakArea && profile.weakTopics.includes(topicName)) {
      profile.weakTopics = profile.weakTopics.filter(t => t !== topicName);
    }

    await profile.save();
    res.json({ message: 'Session scores recorded successfully!', profile });

  } catch (error) {
    res.status(500).json({ message: 'Failed to record quiz results data frame', error: error.message });
  }
});

// GET /api/quiz/history
router.get('/history', protect, async (req, res) => {
  try {
    const profile = await Progress.findOne({ userId: req.user.id });
    if (!profile) {
      return res.json({ quizzesTaken: [] });
    }
    // Return the last 5 quizzes taken, newest first
    const history = profile.quizzesTaken.slice(-5).reverse();
    res.json({ quizzesTaken: history });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quiz history', error: error.message });
  }
});

// POST: Wipe History and Reset Weakness Metrics
router.post('/clear-history', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Drop records inside Progress collection for this user
    await Progress.findOneAndDelete({ userId: decoded.userId });
    
    res.json({ success: true, message: 'Data tracker flushed cleanly.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error clearing database matrices' });
  }
});
module.exports = router;