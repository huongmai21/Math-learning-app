const express = require("express");
const router = express.Router();
const {
  getScores,
  getLibraryItems,
  getPosts,
  getCourses,
  addLibraryItem,
  createPost,
  enrollCourse,
  createCourse,
} = require("../controllers/profileController");
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");

router.get("/scores", authenticateToken, getScores);
router.get("/library", authenticateToken, getLibraryItems);
router.get("/posts", authenticateToken, getPosts);
router.get("/courses", authenticateToken, getCourses);
router.post("/library", authenticateToken, addLibraryItem);
router.post("/posts", authenticateToken, createPost);
router.post("/courses/enroll", authenticateToken, enrollCourse);
router.post("/courses", authenticateToken, createCourse);

module.exports = router;