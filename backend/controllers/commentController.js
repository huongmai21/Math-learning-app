const Comment = require("../models/Comment");
const Document = require("../models/Document");
const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.getCommentsByDocument = asyncHandler(async (req, res, next) => {
  const { referenceId } = req.params;
  const { type, page = 1, limit = 5 } = req.query;

  if (!["post", "article", "document"].includes(type)) {
    return next(
      new ErrorResponse(
        "Loại tham chiếu không hợp lệ. Phải là 'post', 'article' hoặc 'document'.",
        400
      )
    );
  }

  const skip = (page - 1) * limit;

  const rootComments = await Comment.find({
    referenceType: type,
    referenceId: referenceId,
    parentComment: null,
  })
    .sort({ createdAt: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit))
    .populate("author", "username fullName");

  const total = await Comment.countDocuments({
    referenceType: type,
    referenceId: referenceId,
    parentComment: null,
  });

  const rootIds = rootComments.map((c) => c._id);
  const replies = await Comment.find({
    parentComment: { $in: rootIds },
  }).populate("author", "username");

  res.status(200).json({
    success: true,
    comments: rootComments,
    replies,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
  });
});

exports.createComment = asyncHandler(async (req, res, next) => {
  const { referenceId, referenceType, content } = req.body;

  if (!content) {
    return next(
      new ErrorResponse("Nội dung bình luận không được để trống", 400)
    );
  }

  if (!["post", "article", "document"].includes(referenceType)) {
    return next(
      new ErrorResponse(
        "Loại tham chiếu không hợp lệ. Phải là 'post', 'article' hoặc 'document'.",
        400
      )
    );
  }

  const newComment = new Comment({
    referenceType,
    referenceId,
    author: req.user.id,
    content,
  });

  await newComment.save();
  const populatedComment = await newComment.populate(
    "author",
    "username fullName"
  );

  // Create notification for document owner
  if (referenceType === "document") {
    const document = await Document.findById(referenceId).populate(
      "uploadedBy"
    );
    if (document && document.uploadedBy._id.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: document.uploadedBy._id,
        sender: req.user.id,
        type: "comment",
        title: "Bình luận mới",
        message: `${req.user.username} đã bình luận trên tài liệu "${document.title}"`,
        link: `/documents/detail/${referenceId}`,
        relatedModel: "Document",
        relatedId: referenceId,
        importance: "medium",
      });
      await notification.save();
      global.io.to(document.uploadedBy._id.toString()).emit("newNotification", {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        createdAt: new Date(),
      });
    }
  }

  res.status(201).json({
    success: true,
    message: "Gửi bình luận thành công!",
    comment: populatedComment,
  });
});

exports.updateComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse("Không tìm thấy bình luận", 404));
  }

  if (comment.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Bạn không có quyền sửa bình luận này", 403));
  }

  comment.content = content || comment.content;
  await comment.save();

  res.status(200).json({ success: true, message: "Đã sửa bình luận", comment });
});

exports.deleteComment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return next(new ErrorResponse("Không tìm thấy bình luận", 404));
  }

  if (comment.author.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse("Bạn không có quyền xóa bình luận này", 403));
  }

  await Comment.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, message: "Đã xóa bình luận" });
});
