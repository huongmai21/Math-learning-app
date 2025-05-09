const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  fileUrl: { type: String, required: true },
  thumbnail: String,
  educationLevel: { type: String, required: true },
  grade: String,
  subject: String,
  documentType: { type: String, required: true },
  tags: [String],
  content: String, // Nội dung HTML chứa văn bản, công thức toán học
  images: [String], // Danh sách URL hình ảnh
  videoUrl: String, // URL video nhúng
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Document", documentSchema);
