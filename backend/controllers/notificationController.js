// backend/controllers/notificationController.js
const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({
    userId: req.params.userId,
  }).sort({
    createdAt: -1,
  });
  res.status(200).json({ success: true, data: notifications });
});

exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return next(new ErrorResponse("Thông báo không tồn tại", 404));
  }
  if (notification.userId.toString() !== req.user._id.toString()) {
    return next(new ErrorResponse("Không có quyền xóa thông báo này", 403));
  }
  await notification.remove();
  res.status(200).json({ success: true, data: {} });
});

exports.createNotification = asyncHandler(async (req, res, next) => {
  const {
    recipient,
    sender,
    message,
    type,
    title,
    link,
    relatedModel,
    relatedId,
    importance,
    expiresAt,
  } = req.body;
  const notification = await Notification.create({
    recipient,
    sender: sender || req.user.id,
    type,
    title,
    message,
    link,
    relatedModel,
    relatedId,
    importance,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  });

  if (global.io) {
    global.io.to(recipient).emit("newNotification", notification);
  }

  res.status(201).json({ success: true, data: notification });
});

exports.markNotificationRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);

  if (!notification) {
    return next(new ErrorResponse("Thông báo không tồn tại", 404));
  }

  if (notification.recipient.toString() !== req.user.id) {
    return next(new ErrorResponse("Không có quyền chỉnh sửa", 403));
  }

  notification.isRead = true;
  await notification.save();

  res.json({ success: true, data: notification });
});
