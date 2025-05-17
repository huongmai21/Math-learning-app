const Bookmark = require("../models/Bookmark");
const Document = require("../models/Document");
const Course = require("../models/Course");
const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.addBookmark = asyncHandler(async (req, res, next) => {
  const { referenceId, referenceType } = req.body;

  if (!referenceId || !referenceType) {
    return next(new ErrorResponse("Thiếu referenceId hoặc referenceType", 400));
  }

  if (!["document", "course"].includes(referenceType)) {
    return next(new ErrorResponse("Loại tham chiếu không hợp lệ", 400));
  }

  let referencedItem;
  if (referenceType === "document") {
    referencedItem = await Document.findById(referenceId);
  } else if (referenceType === "course") {
    referencedItem = await Course.findById(referenceId);
  }

  if (!referencedItem) {
    return next(new ErrorResponse(`${referenceType} không tồn tại`, 404));
  }

  const existingBookmark = await Bookmark.findOne({
    user: req.user.id,
    referenceId,
    referenceType,
  });

  if (existingBookmark) {
    return next(new ErrorResponse(`${referenceType} đã được đánh dấu`, 400));
  }

  const bookmark = await Bookmark.create({
    user: req.user.id,
    referenceId,
    referenceType,
  });

  // Create notification
  await Notification.create({
    userId: req.user.id,
    message: `Bạn đã bookmark ${referenceType} "${referencedItem.title}".`,
    link:
      referenceType === "document"
        ? `/documents/detail/${referenceId}`
        : `/courses/detail/${referenceId}`,
    relatedModel:
      referenceType.charAt(0).toUpperCase() + referenceType.slice(1),
    relatedId: referenceId,
  });

  res.status(201).json({ success: true, data: bookmark });
});

exports.removeBookmark = asyncHandler(async (req, res, next) => {
  const bookmark = await Bookmark.findOne({
    user: req.user.id,
    referenceId: req.params.id,
  });

  if (!bookmark) {
    return next(new ErrorResponse("Không tìm thấy đánh dấu", 404));
  }

  await Bookmark.findByIdAndDelete(bookmark._id);

  res.status(200).json({ success: true, message: "Đã xóa đánh dấu" });
});

exports.getBookmarks = asyncHandler(async (req, res, next) => {
  const bookmarks = await Bookmark.find({ user: req.user.id }).populate({
    path: "referenceId",
    populate: { path: "uploadedBy instructorId", select: "username" },
  });

  const formattedBookmarks = bookmarks
    .filter((bookmark) => bookmark.referenceId)
    .map((bookmark) => {
      const item = bookmark.referenceId;
      return {
        _id: bookmark._id,
        referenceId: bookmark.referenceId._id,
        referenceType: bookmark.referenceType,
        item: {
          title: item.title,
          thumbnail: item.thumbnail || "",
          downloads: item.downloads || 0,
          views: item.views || 0,
          ...(bookmark.referenceType === "course" && { price: item.price }),
        },
      };
    });

  res.status(200).json({ success: true, data: formattedBookmarks });
});

exports.checkBookmark = asyncHandler(async (req, res, next) => {
  const bookmark = await Bookmark.findOne({
    user: req.user.id,
    referenceId: req.params.id,
  });

  res.status(200).json({
    success: true,
    isBookmarked: !!bookmark,
  });
});
