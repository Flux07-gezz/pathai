const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizzesTaken: [{
    quizId: mongoose.Schema.Types.ObjectId,
    topicName: String,
    score: Number,
    totalQuestions: Number,
    date: { type: Date, default: Date.now }
  }],
  completedRoadmapDays: {
    type: [Number], // e.g., [1, 2, 5] representing day sequences checked off
    default: []
  },
  weakTopics: {
    type: [String], // e.g., ["Trigonometry Sub-sections", "Optics Laws"]
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);