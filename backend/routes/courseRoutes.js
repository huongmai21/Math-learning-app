const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const authenticateToken = require("../middleware/authMiddleware");
const checkRole = require("../middleware/roleMiddleware");

// Lấy danh sách khóa học của người dùng (giáo viên hoặc học sinh)
router.get("/", authenticateToken, courseController.getCourses);

// Đăng ký khóa học
router.get("/courses/enroll", authenticateToken, courseController.enrollCourse);

// Tạo khóa học mới
router.post(
  "/create",
  authenticateToken,
  checkRole(["admin", "teacher"]),
  courseController.createCourse
);

module.exports = router;