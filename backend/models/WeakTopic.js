const mongoose = require('mongoose');

const weakTopicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String, // Tracks the NCERT class level or broad field
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
    default: false
  }
}, {
  timestamps: true
});

// Ensures a student has exactly one record per topic/subtopic to prevent DB clutter
weakTopicSchema.index({ userId: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('WeakTopic', weakTopicSchema);