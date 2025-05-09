const Comment = require("../models/Comment");

// GET /comments/:referenceId?type=:referenceType
exports.getCommentsByDocument = async (req, res) => {
  try {
    const { referenceId } = req.params;
    const { type, page = 1, limit = 5 } = req.query;

    if (!['post', 'article', 'document'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid referenceType. Must be 'post', 'article', or 'document'."
      });
    }

    const skip = (page - 1) * limit;

    // Lấy các bình luận gốc
    const rootComments = await Comment.find({
      referenceType: type,
      referenceId: referenceId,
      parentComment: null,
    })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .populate("author", "username fullName");

    // Lấy tổng số bình luận gốc
    const total = await Comment.countDocuments({
      referenceType: type,
      referenceId: referenceId,
      parentComment: null,
    });

    // Lấy replies (1 lần cho tất cả root comments)
    const rootIds = rootComments.map((c) => c._id);
    const replies = await Comment.find({ parentComment: { $in: rootIds } })
      .populate("author", "username");

    return res.status(200).json({
      success: true,
      comments: rootComments,
      replies,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bình luận",
      error: err.message,
    });
  }
};

// POST /comments (yêu cầu xác thực)
exports.createComment = async (req, res) => {
  try {
    const { referenceId, referenceType, content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Nội dung không được để trống" });
    }

    if (!['post', 'article', 'document'].includes(referenceType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid referenceType. Must be 'post', 'article', or 'document'."
      });
    }
    
    const newComment = new Comment({
      referenceType,
      referenceId,
      author: req.user.id,
      content
    });

    await newComment.save();
    // Ghi lại hoạt động
    const activity = new UserActivity({
      userId,
      type: "comment",
      description: "Đã thêm 1 bình luận",
    });
    await activity.save();

    const populatedComment = await newComment.populate("author", "username fullName");

    return res.status(201).json({
      success: true,
      message: "Gửi bình luận thành công!",
      comment: populatedComment
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Lỗi khi gửi bình luận", error: err.message });
  }
};

// Sửa bình luận
exports.updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bình luận." });
    }

    // Chỉ tác giả hoặc admin được sửa
    if (comment.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Không có quyền sửa bình luận này." });
    }

    comment.content = content || comment.content;
    await comment.save();

    res.status(200).json({ success: true, message: "Đã sửa bình luận.", comment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};

// Xoá bình luận
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bình luận." });
    }

    if (comment.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Không có quyền xoá bình luận này." });
    }

    await Comment.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: "Đã xoá bình luận." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Lỗi server", error: err.message });
  }
};