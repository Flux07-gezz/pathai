
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  studentLevel: { type: String, default: 'Class 10' }, // e.g., "Class 10", "Class 12"
  educationBoard: { type: String, default: 'CBSE' }    // e.g., "CBSE", "ICSE"
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);