const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config();

const questions = [
  {
    question: "What is 2 + 2?",
    options: ["2", "4", "6", "8"],
    answer: "4",
    subject: "Math",
    topic: "Algebra",
    difficulty: "easy"
  },
  {
    question: "Solve: 5x = 25, x = ?",
    options: ["3", "4", "5", "6"],
    answer: "5",
    subject: "Math",
    topic: "Algebra",
    difficulty: "easy"
  },
  {
    question: "What is the probability of getting heads in a coin toss?",
    options: ["1/4", "1/3", "1/2", "1"],
    answer: "1/2",
    subject: "Math",
    topic: "Probability",
    difficulty: "easy"
  },
  {
    question: "A dice is rolled. Probability of getting 6?",
    options: ["1/6", "1/3", "1/2", "1"],
    answer: "1/6",
    subject: "Math",
    topic: "Probability",
    difficulty: "easy"
  },
  {
    question: "What is the area of a triangle with base 4 and height 6?",
    options: ["10", "12", "24", "48"],
    answer: "12",
    subject: "Math",
    topic: "Geometry",
    difficulty: "easy"
  },
  {
    question: "How many sides does a hexagon have?",
    options: ["4", "5", "6", "7"],
    answer: "6",
    subject: "Math",
    topic: "Geometry",
    difficulty: "easy"
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected!');
    await Question.deleteMany({});
    await Question.insertMany(questions);
    console.log('Questions seeded successfully!');
    process.exit();
  })
  .catch((err) => {
    console.log('Error:', err.message);
    process.exit(1);
  });