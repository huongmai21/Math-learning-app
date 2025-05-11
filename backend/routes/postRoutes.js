const express = require("express");
const router = express.Router();
const {
  getPosts,
  createPost,
  likePost,
  addComment,
  sharePost,
  bookmarkPost,
} = require("../controllers/postsController");
const { authenticateToken } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

router
  .route("/")
  .get(authenticateToken, getPosts)
  .post(authenticateToken, upload.array("attachments"), createPost);
router.route("/:id/like").put(authenticateToken, likePost);
router.route("/:id/comment").put(authenticateToken, addComment);
router.route("/:id/share").put(authenticateToken, sharePost);
router.route("/:id/bookmark").put(authenticateToken, bookmarkPost);

module.exports = router;
