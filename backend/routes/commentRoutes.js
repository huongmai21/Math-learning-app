const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authenticateToken = require("../middleware/authMiddleware");

// Lấy bình luận của 1 tài liệu
router.get("/:referenceId", commentController.getCommentsByDocument);

// Tạo bình luận (cần đăng nhập)
router.post("/", authenticateToken, commentController.createComment);

// PUT update comment (auth + check quyền)
router.put("/:id", authenticateToken, commentController.updateComment);

// DELETE comment (auth + check quyền)
router.delete("/:id", authenticateToken, commentController.deleteComment);

module.exports = router;
