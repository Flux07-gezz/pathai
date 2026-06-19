const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const SolvedQuestion = require('../models/SolvedQuestion');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get('/generate-questions', async (req, res) => {
  const { userId, subject, topic } = req.query;

  // 1. DEFENSIVE LOCAL FALLBACK DATA GRID
  const fallbackQuestions = [
    { questionText: "Solve for x: 2x + 7 = 15.", options: ["2", "4", "6", "8"], correctAnswer: "4", topic: "Algebra" },
    { questionText: "What is the derivative of x^2 with respect to x?", options: ["x", "2x", "2", "x^2"], correctAnswer: "2x", topic: "Calculus" },
    { questionText: "Find the value of sin(90°).", options: ["0", "0.5", "1", "Undefined"], correctAnswer: "1", topic: "Trigonometry" },
    { questionText: "Which of these is a prime number?", options: ["4", "9", "11", "15"], correctAnswer: "11", topic: "Number Systems" }
  ];

  try {
    // 2. FETCH USER PROFILE PREFERENCES
    const user = await User.findById(userId).catch(() => null);
    const board = user?.educationBoard || 'CBSE';
    const level = user?.studentLevel || 'Class 10';

    // 3. SECURE HISTORY LOOKUP
    let blacklist = '';
    if (userId) {
      const solvedRecords = await SolvedQuestion.find({ userId, subject }).catch(() => []);
      blacklist = solvedRecords.map(r => r.questionText).join('\n');
    }

    // 4. ATTEMPT LIVE GEMINI COMPILATION
    const prompt = `
      You are an expert examiner for the Indian ${board} Board curriculum.
      Generate a quiz of exactly 10 multiple-choice questions for ${level} on Subject: "${subject}" and Topic: "${topic || 'General'}".
      Align completely with official ${board} textbook metrics.
      
      Do NOT generate any of these previously solved questions:
      ${blacklist || 'None'}
      
      Return JSON only matching this structure precisely:
      {
        "questions": [
          {
            "questionText": "Technical question text?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "Exact string option choice",
            "topic": "${topic || 'General'}"
          }
        ]
      }
    `;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let cleanText = response.text().trim();

    if (cleanText.startsWith("```json")) cleanText = cleanText.substring(7, cleanText.length - 3).trim();
    if (cleanText.startsWith("```")) cleanText = cleanText.substring(3, cleanText.length - 3).trim();

    const quizData = JSON.parse(cleanText);
    
    if (quizData && Array.isArray(quizData.questions) && quizData.questions.length > 0) {
      return res.json(quizData.questions);
    }
    
    throw new Error("Invalid array structure parsed from generative AI engine.");

  } catch (error) {
    console.warn("Engaging backend safety layer. Serving local syllabus fallback question data:", error.message);
    // Gracefully returns high-quality fallback questions instead of throwing a 500 internal crash
    return res.json(fallbackQuestions);
  }
});

// SUBMIT RESULTS ROUTE
router.post('/submit', async (req, res) => {
  const { userId, subject, questionsData } = req.body;
  try {
    if (userId && questionsData && Array.isArray(questionsData)) {
      const records = questionsData.map(q => ({
        userId,
        subject,
        topic: q.topic || 'General',
        questionText: q.questionText || 'Sample'
      }));
      await SolvedQuestion.insertMany(records);
    }
    res.json({ message: "Progress logged successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;