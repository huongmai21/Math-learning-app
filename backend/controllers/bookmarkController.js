const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Bookmark = require("../models/Bookmark");
const Course = require("../models/Course");
const Notification = require("../models/Notification");

exports.addBookmark = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  const existingBookmark = await Bookmark.findOne({
    userId: req.user._id,
    courseId,
  });
  if (existingBookmark) {
    return next(new ErrorResponse("Khóa học đã được bookmark", 400));
  }
  const bookmark = await Bookmark.create({
    userId: req.user._id,
    courseId,
  });
  await Notification.create({
    userId: req.user._id,
    message: `Bạn đã bookmark khóa học "${course.title}".`,
  });
  res.status(201).json({ success: true, data: bookmark });
});

exports.removeBookmark = asyncHandler(async (req, res, next) => {
  const bookmark = await Bookmark.findOne({
    userId: req.user._id,
    courseId: req.params.courseId,
  });
  if (!bookmark) {
    return next(new ErrorResponse("Bookmark không tồn tại", 404));
  }
  await bookmark.remove();
  res.status(200).json({ success: true, data: {} });
});

exports.getBookmarks = asyncHandler(async (req, res, next) => {
  const bookmarks = await Bookmark.find({ userId: req.user._id }).populate({
    path: "courseId",
    populate: { path: "instructorId", select: "username" },
  });
  res.status(200).json({ success: true, data: bookmarks });
});