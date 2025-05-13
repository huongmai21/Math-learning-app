const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticateToken } = require("../middleware/authMiddleware");

router
  .route("/me")
  .get(authenticateToken, notificationController.getNotifications);
router
  .route("/:id")
  .delete(authenticateToken, notificationController.deleteNotification);
router
  .route("/:id/read")
  .put(authenticateToken, notificationController.markNotificationRead);
router
  .route("/")
  .post(authenticateToken, notificationController.createNotification);

module.exports = router;
