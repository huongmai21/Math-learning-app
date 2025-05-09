const express = require("express");
const router = express.Router();
const {
  getProfile,
  getUserActivity,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserSuggestions,
} = require("../controllers/usersController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

router.route("/profile").get(protect, getProfile);
router.route("/activity").get(protect, getUserActivity);
router
  .route("/")
  .put(
    protect,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    updateProfile
  );
router.route("/:id/follow").put(protect, followUser);
router.route("/:id/unfollow").put(protect, unfollowUser);
router.route("/followers").get(protect, getFollowers);
router.route("/following").get(protect, getFollowing);
router.route("/suggestions").get(protect, getUserSuggestions);

module.exports = router;
