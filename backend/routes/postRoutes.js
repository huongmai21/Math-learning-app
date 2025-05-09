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
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

router
  .route("/")
  .get(protect, getPosts)
  .post(protect, upload.array("attachments"), createPost);
router.route("/:id/like").put(protect, likePost);
router.route("/:id/comment").put(protect, addComment);
router.route("/:id/share").put(protect, sharePost);
router.route("/:id/bookmark").put(protect, bookmarkPost);

module.exports = router;
