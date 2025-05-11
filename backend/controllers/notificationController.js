// backend/controllers/notificationController.js
const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.getNotifications = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (userId !== req.user.id) {
    return next(new ErrorResponse("Không có quyền truy cập", 403));
  }

  const notifications = await Notification.find({
    recipient: userId,
    $or: [{ expiresAt: { $gte: new Date() } }, { expiresAt: null }],
  })
    .sort({ createdAt: -1 })
    .limit(10);
  res.json({ success: true, data: notifications });
});

exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const notification = await Notification.findById(id);

  if (!notification) {
    return next(new ErrorResponse("Thông báo không tồn tại", 404));
  }

  if (notification.recipient.toString() !== req.user.id) {
    return next(new ErrorResponse("Không có quyền xóa", 403));
  }

  await notification.remove();
  res.json({ success: true, message: "Thông báo đã được xóa" });
});

exports.createNotification = asyncHandler(async (req, res, next) => {
  const {
    recipient,
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
    sender: req.user.id,
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
