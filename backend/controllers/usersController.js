const User = require("../models/User");
const UserActivity = require("../models/UserActivity");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const cloudinary = require("../config/cloudinary");

exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("followers following");
  if (!user) {
    return next(new ErrorResponse("Người dùng không tồn tại", 404));
  }
  res.json(user);
});

exports.getUserActivity = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const year = req.query.year || new Date().getFullYear();

  const activities = await UserActivity.find({
    userId,
    date: { $regex: `^${year}` }, // Lọc theo năm
  });

  // Tạo dữ liệu cho heatmap giống GitHub
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);
  const fullActivity = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const act = activities.find((a) => a.date === dateStr) || {
      date: dateStr,
      count: 0,
      description: [],
    };
    fullActivity.push({
      date: act.date,
      count: act.count || 0,
      description: act.description || [],
    });
  }

  res.status(200).json({
    activity: fullActivity,
    total: activities.reduce((sum, act) => sum + (act.count || 0), 0),
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { username, email } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse("Người dùng không tồn tại", 404));
  }

  let avatarUrl = user.avatar;
  if (req.files && req.files.avatar) {
    const result = await cloudinary.uploader.upload(req.files.avatar[0].path);
    avatarUrl = result.secure_url;
  }

  user.username = username || user.username;
  user.email = email || user.email;
  user.avatar = avatarUrl;

  await user.save();

  res.status(200).json({ success: true, data: user });
});

exports.followUser = asyncHandler(async (req, res, next) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);
  if (!userToFollow || !currentUser) {
    return next(new ErrorResponse("Người dùng không tồn tại", 404));
  }

  if (!currentUser.following.includes(userToFollow._id)) {
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);
    await currentUser.save();
    await userToFollow.save();

    await UserActivity.findOneAndUpdate(
      {
        userId: currentUser._id,
        date: new Date().toISOString().split("T")[0],
        type: "follow",
      },
      {
        $set: { description: `Followed ${userToFollow.username}` },
        $inc: { count: 1 },
      },
      { upsert: true, new: true }
    );
  }
  res.json({ message: "Followed successfully" });
});

exports.unfollowUser = asyncHandler(async (req, res, next) => {
  const userToUnfollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user.id);
  if (!userToUnfollow || !currentUser) {
    return next(new ErrorResponse("Người dùng không tồn tại", 404));
  }

  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== userToUnfollow._id.toString()
  );
  userToUnfollow.followers = userToUnfollow.followers.filter(
    (id) => id.toString() !== currentUser._id.toString()
  );
  await currentUser.save();
  await userToUnfollow.save();
  res.json({ message: "Unfollowed successfully" });
});

exports.getFollowers = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate(
    "followers",
    "username avatar bio"
  );
  res.json(user.followers);
});

exports.getFollowing = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate(
    "following",
    "username avatar bio"
  );
  res.json(user.following);
});

exports.getUserSuggestions = asyncHandler(async (req, res, next) => {
  const users = await User.find({ _id: { $ne: req.user.id } })
    .select("username avatar bio")
    .limit(5);
  res.json({ data: users });
});
