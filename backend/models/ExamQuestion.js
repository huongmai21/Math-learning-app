// models/ExamQuestion.js
const mongoose = require("mongoose")
const { Schema } = mongoose

const examQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ["multiple-choice", "true-false", "fill-in", "essay", "matching"],
  },
  options: [
    {
      text: String,
      isCorrect: Boolean,
    },
  ],
  correctAnswer: { type: Schema.Types.Mixed }, // Depends on question type
  explanation: { type: String },
  points: { type: Number, default: 1 },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
  },
  tags: [{ type: String }],
  images: [{ type: String }], // URLs to images
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
})

const ExamQuestion = mongoose.model("ExamQuestion", examQuestionSchema)

module.exports = ExamQuestion
