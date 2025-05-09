const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookmarkSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  referenceType: {
    type: String,
    required: true,
    enum: ["post", "document"], // Thêm 'document'
  },
  referenceId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "referenceType",
  },
  createdAt: { type: Date, default: Date.now },
});

// Đảm bảo không bookmark trùng lặp
bookmarkSchema.index(
  { user: 1, referenceType: 1, referenceId: 1 },
  { unique: true }
);

module.exports = mongoose.model("Bookmark", bookmarkSchema);
