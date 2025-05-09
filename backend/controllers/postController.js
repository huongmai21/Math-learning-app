const Post = require("../models/Post");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require("../config/cloudinary");

// Get all posts with optional filters
exports.getPosts = asyncHandler(async (req, res, next) => {
  const { category, content, bookmarked, page = 1, limit = 5 } = req.query;
  const query = {};

  if (category) query.category = category;
  if (category === "question" && req.query.category_ne) {
    query.category = { $ne: "question" };
  }
  if (content) query.content = { $regex: content, $options: "i" };
  if (bookmarked) query.bookmarks = req.user._id;

  const posts = await Post.find(query)
    .populate("author", "username avatar")
    .populate("comments.user", "username avatar")
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: posts });
});

// Create a new post
exports.createPost = asyncHandler(async (req, res, next) => {
  const { title, content, category, grade, subject } = req.body;
  const attachments = [];

  if (req.files) {
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      attachments.push(result.secure_url);
    }
  }

  const post = await Post.create({
    title,
    content,
    category: category || "general",
    grade,
    subject,
    author: req.user._id,
    attachments,
  });

  res.status(201).json({ success: true, data: post });
});

// Like a post
exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorResponse("Bài đăng không tồn tại", 404));
  }

  if (post.likes.includes(req.user._id)) {
    post.likes = post.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
  } else {
    post.likes.push(req.user._id);
  }

  await post.save();
  res.status(200).json({ success: true, data: post });
});

// Add a comment to a post
exports.addComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new ErrorResponse("Bài đăng không tồn tại", 404));
  }

  post.comments.push({ user: req.user._id, content });
  await post.save();

  res.status(200).json({ success: true, data: post });
});

// Share a post
exports.sharePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorResponse("Bài đăng không tồn tại", 404));
  }

  post.shares = (post.shares || 0) + 1;
  await post.save();

  res.status(200).json({ success: true, data: post });
});

// Bookmark a post
exports.bookmarkPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new ErrorResponse("Bài đăng không tồn tại", 404));
  }

  if (post.bookmarks.includes(req.user._id)) {
    post.bookmarks = post.bookmarks.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
  } else {
    post.bookmarks.push(req.user._id);
  }

  await post.save();
  res.status(200).json({ success: true, data: post });
});
