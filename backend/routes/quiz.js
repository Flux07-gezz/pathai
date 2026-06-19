const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const QuizScore = require('../models/QuizScore');
const WeakTopic = require('../models/WeakTopic');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate questions using Gemini
async function generateQuestionsWithGemini(subject, difficulty, count) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
    Generate exactly ${count} multiple choice quiz questions for "${subject}" 
    at "${difficulty}" difficulty for high school students.
    
    Return ONLY a valid JSON array, no extra text, no markdown:
    [
      {
        "question": "question text",
        "options": ["A", "B", "C", "D"],
        "answer": "correct option exactly as in options",
        "topic": "specific topic within ${subject}"
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('Gemini raw response:', text.substring(0, 200));
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return parsed;
  } catch (err) {
    console.log('Gemini generation error:', err.message);
    throw err;
  }
}

// Get weak topics — MUST be before /:subject/:difficulty
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

// Get questions — mix of saved + AI generated
router.get('/:subject/:difficulty', async (req, res) => {
  try {
    const { subject, difficulty } = req.params;
    const TOTAL_QUESTIONS = 10;

    // Step 1 — fetch existing questions from MongoDB
    const savedQuestions = await Question.find({ subject, difficulty })
      .limit(TOTAL_QUESTIONS);

    let questions = [...savedQuestions];

    // Step 2 — generate remaining with Gemini if needed
    if (savedQuestions.length < TOTAL_QUESTIONS) {
      const needed = TOTAL_QUESTIONS - savedQuestions.length;
      console.log(`Generating ${needed} questions with Gemini...`);

      try {
        const generated = await generateQuestionsWithGemini(subject, difficulty, needed);

        const toSave = generated.map(q => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
          topic: q.topic,
          subject,
          difficulty,
          aiGenerated: true
        }));

        const saved = await Question.insertMany(toSave);
        questions = [...questions, ...saved];
        console.log(`Saved ${saved.length} new questions to DB`);

      } catch (geminiErr) {
        console.log('Gemini failed:', geminiErr.message);
        if (questions.length === 0) {
          return res.status(503).json({
            message: 'Could not generate questions. Please try again in a moment.'
          });
        }
      }
    }

    // Step 3 — shuffle and return
    questions = questions.sort(() => Math.random() - 0.5);
    res.json(questions);

  } catch (error) {
    console.log('Quiz route error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
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
        { userId, subject, topic },
        { userId, subject, topic, score, isWeak: score < 50 },
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Quiz submitted successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;