const express = require("express");
const router = express.Router();
const { addBookmark, removeBookmark, getBookmarks } = require("../controllers/bookmarkController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/", authenticateToken, addBookmark);
router.delete("/:courseId", authenticateToken, removeBookmark);
router.get("/", authenticateToken, getBookmarks);

module.exports = router;