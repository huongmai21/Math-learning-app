const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");

router.get("/admin/users", adminController.getUsers);
router.delete("/admin/users/:id", adminController.deleteUser);
router.get("/admin/exams", adminController.getExams);
router.put("/admin/exams/:id/approve", adminController.approveExam);
router.put("/admin/exams/:id/reject", adminController.rejectExam);
router.delete("/admin/exams/:id", adminController.deleteExam);
router.get("/admin/stats", adminController.getStats);
router.get("/admin/library", adminController.getLibraryItems);
router.delete("/admin/library/:id", adminController.deleteLibraryItem);

module.exports = router;
