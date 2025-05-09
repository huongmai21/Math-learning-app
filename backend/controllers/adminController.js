const User = require("../models/User");
const Exam = require("../models/Exam");
const LibraryItem = require("../models/LibraryItem");
const Course = require("../models/Course");
const Post = require("../models/Post");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("username email role");
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.remove();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find().populate("author", "username");
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    exam.status = "approved";
    await exam.save();
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    exam.status = "rejected";
    await exam.save();
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    await exam.remove();
    res.json({ message: "Exam deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalExams = await Exam.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalPosts = await Post.countDocuments();
    res.json({
      totalUsers,
      totalExams,
      totalCourses,
      totalPosts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLibraryItems = async (req, res) => {
  try {
    const items = await LibraryItem.find();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLibraryItem = async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);
    if (!item)
      return res.status(404).json({ message: "Library item not found" });
    await item.remove();
    res.json({ message: "Library item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
