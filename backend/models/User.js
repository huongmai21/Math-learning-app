// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ProgressSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  completedContents: [
    {
      type: mongoose.Schema.Types.ObjectId,
    },
  ],
});

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Vui lòng nhập tên người dùng"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Vui lòng nhập email"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Vui lòng nhập email hợp lệ"],
  },
  password: {
    type: String,
    required: [true, "Vui lòng nhập mật khẩu"],
    minlength: [10, "Mật khẩu phải có ít nhất 10 ký tự"],
    match: [
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/,
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt",
    ],
    select: false,
  },
  role: {
    type: String,
    enum: ["student", "teacher", "admin"],
    default: "student",
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
    trim: true,
  },
  badges: [
    {
      type: { type: String, enum: ["gold", "silver", "bronze"] },
      awardedAt: { type: Date, default: Date.now },
    },
  ],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  progress: [ProgressSchema],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(12); // Tăng salt rounds từ 10 lên 12
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);