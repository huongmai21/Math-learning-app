// models/Comment.js
const mongoose = require("mongoose")
const { Schema } = mongoose

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  referenceType: {
    type: String,
    required: true,
    enum: ["post", "article", "document", "exam"], // Thêm 'exam'
  },
  referenceId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "referenceType",
  },
  parentComment: { type: Schema.Types.ObjectId, ref: "Comment" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  isAcceptedAnswer: { type: Boolean, default: false },
})

commentSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

commentSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updatedAt: Date.now() })
  next()
})

commentSchema.pre("save", function (next) {
  const validTypes = ["post", "article", "document", "exam"]
  if (!validTypes.includes(this.referenceType)) {
    return next(new Error("Invalid referenceType"))
  }
  if (!this.referenceId) {
    return next(new Error("referenceId is required"))
  }
  next()
})

const Comment = mongoose.model("Comment", commentSchema)

module.exports = Comment
