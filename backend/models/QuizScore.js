const mongoose = require('mongoose');

const quizScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topicScores: {
    type: Map,
    of: Number
  },
  totalScore: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QuizScore', quizScoreSchema);