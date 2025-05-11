const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const Course = require("../models/Course");
const User = require("../models/User");
const Review = require("../models/Review");
const stripe = require("../config/stripe");

exports.getCourses = asyncHandler(async (req, res, next) => {
  const { filter } = req.query;
  let query = {};

  if (filter) {
    query.instructorId = filter;
  }

  const courses = await Course.find(query).populate("instructorId", "username");
  res.status(200).json({ success: true, data: courses });
});

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate(
    "instructorId",
    "username"
  );
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  res.status(200).json({ success: true, data: course });
});

exports.createCourse = asyncHandler(async (req, res, next) => {
  const { title, description, price } = req.body;
  const course = await Course.create({
    title,
    description,
    price,
    instructorId: req.user._id,
  });
  res.status(201).json({ success: true, data: course });
});

exports.updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (course.instructorId.toString() !== req.user._id.toString()) {
    return next(
      new ErrorResponse("Không có quyền chỉnh sửa khóa học này", 403)
    );
  }
  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({ success: true, data: updatedCourse });
});

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (course.instructorId.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Không có quyền xóa khóa học này", 403));
  }
  await course.remove();
  res.status(200).json({ success: true, data: {} });
});

exports.enrollCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (course.students.includes(req.user._id)) {
    return next(new ErrorResponse("Bạn đã đăng ký khóa học này", 400));
  }
  course.students.push(req.user._id);
  await course.save();
  res
    .status(200)
    .json({ success: true, data: { message: "Đăng ký thành công" } });
});

exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { amount } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (course.price !== amount) {
    return next(new ErrorResponse("Số tiền không khớp", 400));
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,
    currency: "vnd",
    metadata: { courseId: req.params.id, userId: req.user._id.toString() },
  });

  res
    .status(200)
    .json({ success: true, clientSecret: paymentIntent.client_secret });
});

exports.addCourseContent = asyncHandler(async (req, res, next) => {
  const { title, type, url, isPreview } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (course.instructorId.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Không có quyền thêm nội dung", 403));
  }
  course.contents.push({ title, type, url, isPreview });
  await course.save();
  res.status(201).json({ success: true, data: course });
});

exports.updateCourseContent = asyncHandler(async (req, res, next) => {
  const { title, type, url, isPreview } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (course.instructorId.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Không có quyền chỉnh sửa nội dung", 403));
  }
  const content = course.contents.id(req.params.contentId);
  if (!content) {
    return next(new ErrorResponse("Nội dung không tồn tại", 404));
  }
  content.title = title || content.title;
  content.type = type || content.type;
  content.url = url || content.url;
  content.isPreview = isPreview !== undefined ? isPreview : content.isPreview;
  await course.save();
  res.status(200).json({ success: true, data: course });
});

exports.deleteCourseContent = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (course.instructorId.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Không có quyền xóa nội dung", 403));
  }
  const content = course.contents.id(req.params.contentId);
  if (!content) {
    return next(new ErrorResponse("Nội dung không tồn tại", 404));
  }
  content.remove();
  await course.save();
  res.status(200).json({ success: true, data: course });
});

exports.updateProgress = asyncHandler(async (req, res, next) => {
  const { contentId, completed } = req.body;
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (!course.students.includes(req.user._id)) {
    return next(new ErrorResponse("Bạn chưa đăng ký khóa học này", 403));
  }
  const content = course.contents.id(contentId);
  if (!content) {
    return next(new ErrorResponse("Nội dung không tồn tại", 404));
  }
  let user = await User.findById(req.user._id);
  let progress = user.progress.find(
    (p) => p.courseId.toString() === req.params.courseId
  );
  if (!progress) {
    progress = { courseId: req.params.courseId, completedContents: [] };
    user.progress.push(progress);
  }
  if (completed && !progress.completedContents.includes(contentId)) {
    progress.completedContents.push(contentId);
  } else if (!completed) {
    progress.completedContents = progress.completedContents.filter(
      (id) => id.toString() !== contentId
    );
  }
  await user.save();
  res.status(200).json({ success: true, data: progress });
});

exports.getProgress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const progress = user.progress.find(
    (p) => p.courseId.toString() === req.params.courseId
  );
  if (!progress) {
    return res
      .status(200)
      .json({
        success: true,
        data: { courseId: req.params.courseId, completedContents: [] },
      });
  }
  res.status(200).json({ success: true, data: progress });
});

exports.createReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return next(new ErrorResponse("Khóa học không tồn tại", 404));
  }
  if (!course.students.includes(req.user._id)) {
    return next(new ErrorResponse("Bạn chưa đăng ký khóa học này", 403));
  }
  const existingReview = await Review.findOne({
    courseId: req.params.courseId,
    userId: req.user._id,
  });
  if (existingReview) {
    return next(new ErrorResponse("Bạn đã đánh giá khóa học này", 400));
  }
  const review = await Review.create({
    courseId: req.params.courseId,
    userId: req.user._id,
    rating,
    comment,
  });
  res.status(201).json({ success: true, data: review });
});

exports.getReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ courseId: req.params.courseId }).populate(
    "userId",
    "username"
  );
  res.status(200).json({ success: true, data: reviews });
});
