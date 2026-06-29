const mongoose = require('mongoose');

const weakTopicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  isWeak: {
    type: Boolean,
    default: true
  },
  isStrength: {
    type: Boolean,
    default: false
  },
  markedStrengthManually: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WeakTopic', weakTopicSchema);