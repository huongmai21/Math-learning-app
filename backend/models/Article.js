// models/Article.js
const mongoose = require("mongoose")
const { Schema } = mongoose

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  coAuthors: [{ type: Schema.Types.ObjectId, ref: "User" }],
  pdfUrl: { type: String },
  tags: [{ type: String }],
  publishedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  citations: { type: Number, default: 0 },
})

const Article = mongoose.model("Article", articleSchema)

module.exports = Article
