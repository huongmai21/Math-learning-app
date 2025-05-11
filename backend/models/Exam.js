// backend/models/Exam.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  educationLevel: { type: String, required: true },
  subject: { type: String, required: true },
  duration: { type: Number, required: true },
  questions: [{ type: Schema.Types.Mixed }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Exam", examSchema);