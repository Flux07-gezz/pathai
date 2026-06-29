const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Question = require('../models/Question');
const QuizScore = require('../models/QuizScore');
const WeakTopic = require('../models/WeakTopic');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── AUTH MIDDLEWARE ──
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

// ── SLEEP HELPER ──
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── GEMINI QUESTION GENERATOR (NCERT aware + retry + fallback) ──
async function generateQuestionsWithGemini(topic, studentClass, count, retries = 3) {
  const finalCount = parseInt(count) || 5;

  const model = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const dynamicSeed = Math.random().toString(36).substring(7);
  const cacheBusterTimestamp = Date.now();

  const prompt = `
    You are an expert tutor specialized in the Indian CBSE and NCERT curriculum frameworks.
    Target Academic Level: ${studentClass}
    Requested Core Topic/Chapter: "${topic}"
    Verification Token: ${dynamicSeed}-${cacheBusterTimestamp}

    CRITICAL INSTRUCTIONS:
    1. Generate exactly ${finalCount} distinct multiple-choice question objects inside a root JSON array.
    2. Every question must be 100% unique.
    3. Keep questions strictly about "${topic}" for ${studentClass}.

    Return ONLY this JSON array, no markdown, no backticks:
    [
      {
        "question": "A unique question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "The correct option text matching exactly one entry from options",
        "topic": "${topic}"
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    console.log(`Generated ${arr.length} questions for topic: "${topic}"`);
    return arr;

  } catch (err) {
    console.error(`Gemini Error (Retries left: ${retries}):`, err.message);

    const isRateLimit = err.status === 429 || err.message?.includes('429') || err.message?.includes('Quota exceeded');

    if (isRateLimit && retries > 0) {
      let delayMs = 6000 * (4 - retries);
      if (err.errorDetails?.[0]?.retryDelay) {
        const s = parseInt(err.errorDetails[0].retryDelay);
        if (!isNaN(s)) delayMs = s * 1000;
      }
      console.warn(`Rate limited! Retrying in ${delayMs / 1000}s...`);
      await wait(delayMs);
      return generateQuestionsWithGemini(topic, studentClass, finalCount, retries - 1);
    }

    if (isRateLimit) {
      console.warn('Quota fully locked — deploying fallback questions.');
      return Array.from({ length: finalCount }, (_, i) => ({
        question: `Sample question ${i + 1} about ${topic}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 'Option A',
        topic
      }));
    }

    throw err;
  }
}

// ── SAVE WEAK TOPIC HELPER (with 10-topic limit + strength detection) ──
async function saveWeakTopic(userId, subject, topic, score) {
  const isStrength = score >= 70;
  const isWeak = score < 50;

  // Check if topic already exists
  const existing = await WeakTopic.findOne({ userId, subject, topic });

  if (existing) {
    // Update score and status
    await WeakTopic.findOneAndUpdate(
      { userId, subject, topic },
      {
        score,
        isWeak: isStrength ? false : isWeak,
        isStrength
      }
    );
    return { saved: true, reason: 'updated' };
  }

  // Only save new entry if it's weak
  if (!isWeak) return { saved: false, reason: 'not_weak' };

  // Check 10 topic limit
  const weakCount = await WeakTopic.countDocuments({
    userId,
    isWeak: true,
    isStrength: false
  });

  if (weakCount >= 10) {
    return { saved: false, reason: 'limit_reached' };
  }

  await WeakTopic.create({ userId, subject, topic, score, isWeak: true, isStrength: false });
  return { saved: true, reason: 'created' };
}

// ══════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════

// GET weak topics (legacy route — kept for backward compat)
router.get('/weak/:userId', async (req, res) => {
  try {
    const weakTopics = await WeakTopic.find({
      userId: req.params.userId,
      isWeak: true,
      isStrength: false
    });
    res.json(weakTopics);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET questions by subject + difficulty (mix of saved + AI generated)
router.get('/:subject/:difficulty', async (req, res) => {
  try {
    const { subject, difficulty } = req.params;
    const TOTAL = 10;

    const saved = await Question.find({ subject, difficulty }).limit(TOTAL);
    let questions = [...saved];

    if (saved.length < TOTAL) {
      const needed = TOTAL - saved.length;
      console.log(`Generating ${needed} questions with Gemini...`);

      try {
        const generated = await generateQuestionsWithGemini(subject, 'Class 10', needed);
        const toSave = generated.map(q => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
          topic: q.topic || subject,
          subject,
          difficulty,
          aiGenerated: true
        }));
        const saved2 = await Question.insertMany(toSave);
        questions = [...questions, ...saved2];
      } catch (geminiErr) {
        console.log('Gemini failed:', geminiErr.message);
        if (questions.length === 0) {
          return res.status(503).json({ message: 'Could not generate questions. Please try again.' });
        }
      }
    }

    questions = questions.sort(() => Math.random() - 0.5);
    res.json(questions);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST dynamic NCERT quiz generation
router.post('/generate-dynamic', protect, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ message: 'Please provide a topic' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const studentClass = user.studentClass || 'Class 10';
    console.log(`Processing NCERT Query: "${topic}" for level: ${studentClass}`);

    const generated = await generateQuestionsWithGemini(topic, studentClass, 5);
    const questionsArray = Array.isArray(generated) ? generated : [];

    const toSave = questionsArray.map(q => {
      const questionText = q.question || `Sample question about ${topic}`;
      const options = Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'];
      const answer = q.answer || options[0];
      const correctIdx = options.indexOf(answer);
      return {
        questionText,
        options,
        correctOptionIndex: correctIdx >= 0 ? correctIdx : 0,
        topic: q.topic || topic,
        subject: studentClass,
        difficulty: 'Dynamic-NCERT',
        aiGenerated: true
      };
    });

    return res.json({ questions: toSave });

  } catch (err) {
    console.error('Backend Quiz Generation Failure:', err);
    if (err.status === 429) {
      return res.status(429).json({ message: 'AI quota reached. Please wait and try again.' });
    }
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST submit quiz results (with 10-topic limit + strength detection)
router.post('/submit', async (req, res) => {
  try {
    const { userId, subject, topicScores, totalScore } = req.body;

    // Save quiz score
    const quizScore = new QuizScore({ userId, subject, topicScores, totalScore });
    await quizScore.save();

    // Track weak topics with limit
    const limitReachedTopics = [];

    for (let topic in topicScores) {
      const score = topicScores[topic];
      const result = await saveWeakTopic(userId, subject, topic, score);

      if (result.reason === 'limit_reached') {
        limitReachedTopics.push(topic);
      }
    }

    if (limitReachedTopics.length > 0) {
      return res.json({
        message: 'Quiz submitted!',
        warning: `You already have 10 weak topics stored. Work on your existing weak topics first before new ones can be tracked! Topics not saved: ${limitReachedTopics.join(', ')}`,
        limitReached: true
      });
    }

    res.json({ message: 'Quiz submitted successfully!' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST save score (teammate's route)
router.post('/save-score', protectRoute, async (req, res) => {
  try {
    const { topicName, score, totalQuestions } = req.body;
    const percentage = (score / totalQuestions) * 100;
    await saveWeakTopic(req.userId, 'General', topicName, percentage);
    res.json({ message: 'Score recorded successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record quiz results', error: error.message });
  }
});

// GET quiz history
router.get('/history', protect, async (req, res) => {
  try {
    const scores = await QuizScore.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ quizzesTaken: scores });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quiz history', error: error.message });
  }
});

module.exports = router;