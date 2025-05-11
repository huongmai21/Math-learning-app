const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Score = require("../models/Score");
const LibraryItem = require("../models/LibraryItem");
const Post = require("../models/Post");
const Course = require("../models/Course");

exports.getScores = asyncHandler(async (req, res, next) => {
  const scores = await Score.find({ userId: req.user.id })
    .populate("examId", "title")
    .populate("courseId", "title");
  res.status(200).json({ success: true, data: scores });
});

exports.getLibraryItems = asyncHandler(async (req, res, next) => {
  const items = await LibraryItem.find({ userId: req.user.id });
  res.status(200).json({ success: true, data: items });
});

exports.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find({ userId: req.user.id });
  res.status(200).json({ success: true, data: posts });
});

exports.getCourses = asyncHandler(async (req, res, next) => {
  const { role } = req.user;
  let courses;
  if (role === "student") {
    courses = await Course.find({ students: req.user.id }).populate(
      "instructorId",
      "username"
    );
  } else if (role === "teacher" || role === "admin") {
    courses = await Course.find({ instructorId: req.user.id }).populate(
      "students",
      "username"
    );
  }
  res.status(200).json({ success: true, data: courses });
});

exports.addLibraryItem = asyncHandler(async (req, res, next) => {
  const { title, type, url } = req.body;
  const item = await LibraryItem.create({
    userId: req.user.id,
    title,
    type,
    url,
  });
  res.status(201).json({ success: true, data: item });
});

exports.createPost = asyncHandler(async (req, res, next) => {
  const { title, content, type } = req.body;
  const post = await Post.create({
    userId: req.user.id,
    title,
    content,
    type,
  });
  res.status(201).json({ success: true, data: post });
});

exports.enrollCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (!course.students.includes(req.user.id)) {
    course.students.push(req.user.id);
    await course.save();
  }
  res
    .status(200)
    .json({ success: true, message: "Đăng ký khóa học thành công" });
});

exports.createCourse = asyncHandler(async (req, res, next) => {
  const { title, description, price } = req.body;
  const course = await Course.create({
    title,
    description,
    price,
    instructorId: req.user.id,
  });
  res.status(201).json({ success: true, data: course });
});
