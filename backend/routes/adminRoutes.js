const express = require("express")
const router = express.Router()
const adminController = require("../controllers/adminController")
const { authenticateToken, checkRole } = require("../middleware/authMiddleware")

// Middleware để kiểm tra quyền admin
router.use(authenticateToken, checkRole("admin"))

// Quản lý người dùng
router.get("/admin/users", adminController.getUsers)
router.delete("/admin/users/:id", adminController.deleteUser)
router.put("/admin/users/:id/role", adminController.updateUserRole)

// Quản lý khóa học
router.get("/admin/courses", adminController.getCourses)
router.put("/admin/courses/:id/approve", adminController.approveCourse)
router.put("/admin/courses/:id/reject", adminController.rejectCourse)
router.delete("/admin/courses/:id", adminController.deleteCourse)

// Quản lý đề thi
router.get("/admin/exams", adminController.getExams)
router.put("/admin/exams/:id/approve", adminController.approveExam)
router.put("/admin/exams/:id/reject", adminController.rejectExam)
router.delete("/admin/exams/:id", adminController.deleteExam)

// Quản lý tin tức
router.get("/admin/news", adminController.getNews)
router.put("/admin/news/:id/approve", adminController.approveNews)
router.put("/admin/news/:id/reject", adminController.rejectNews)
router.delete("/admin/news/:id", adminController.deleteNews)

// Quản lý tài liệu
router.get("/admin/documents", adminController.getDocuments)
router.put("/admin/documents/:id/approve", adminController.approveDocument)
router.put("/admin/documents/:id/reject", adminController.rejectDocument)
router.delete("/admin/documents/:id", adminController.deleteDocument)

// Quản lý thư viện
router.get("/admin/library", adminController.getBookmarks)
router.delete("/admin/library/:id", adminController.deleteBookmark)

// Thống kê
router.get("/admin/stats", adminController.getStats)
router.get("/admin/stats/detailed", adminController.getDetailedStats)

module.exports = router
