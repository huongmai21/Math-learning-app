const mongoose = require('mongoose');
const { Schema } = mongoose;

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  thumbnail: { type: String },
  image: { type: String },
  tags: [{ type: String }],
  category: { type: String, required: true, enum: ["education", "math-magazine"] },
  publishedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 }
});

module.exports = mongoose.model('News', newsSchema);