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
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");

router.route("/profile").get(authenticateToken, getProfile);
router.route("/activity").get(authenticateToken, getUserActivity);
router
  .route("/")
  .put(
    authenticateToken,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    updateProfile
  );
router.route("/:id/follow").post(authenticateToken, followUser);
router.route("/:id/unfollow").post(authenticateToken, unfollowUser);
router.route("/followers").get(authenticateToken, getFollowers);
router.route("/following").get(authenticateToken, getFollowing);
router.route("/suggestions").get(authenticateToken, getUserSuggestions);

module.exports = router;
