const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String },
  content: { type: String, required: true },
  category: { type: String, default: 'general' }, // question, general
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grade: { type: String },
  attachments: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  shares: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);