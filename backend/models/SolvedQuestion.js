const mongoose = require('mongoose');

const SolvedQuestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  questionText: { type: String, required: true }
});

module.exports = mongoose.model('SolvedQuestion', SolvedQuestionSchema);