// models/Exam.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  educationLevel: { 
    type: String, 
    enum: ['grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6', 'grade7', 'grade8', 'grade9', 'grade10', 'grade11', 'grade12', 'university'], // Lớp 1-12 và Đại học
    required: true 
  },
  subject: { 
    type: String, 
    enum: ['math', 'advanced_math', 'calculus', 'algebra', 'probability_statistics', 'differential_equations'], // Toán tổng quát và Toán Đại học
    required: true 
  },
  examType: { 
    type: String, 
    enum: ['test', 'competition', 'practice', 'midterm', 'final'] 
  },
  duration: { type: Number },
  totalPoints: { type: Number },
  questions: [{ type: Schema.Types.ObjectId, ref: 'ExamQuestion' }],
  isPublic: { type: Boolean, default: true },
  startTime: { type: Date },
  endTime: { type: Date },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  attempts: { type: Number, default: 0 },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

module.exports = mongoose.model('Exam', examSchema);