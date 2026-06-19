const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // Added field for Indian NCERT curriculum alignment
  studentClass: { 
    type: String, 
    enum: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    default: null 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);