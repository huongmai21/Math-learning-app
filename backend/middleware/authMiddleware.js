const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const redisUtils = require("../config/redis");

exports.authenticateToken = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.replace("Bearer ", "");
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  console.log("Token received:", token); // Debug

  if (!token) {
    return next(new ErrorResponse("Không có token, vui lòng đăng nhập", 401));
  }

  const isBlacklisted = await redisUtils.getCache(`bl_token:${token}`);
  console.log("Is token blacklisted?", isBlacklisted); // Debug

  try {
    let cachedUser = await redisUtils.getCache(`auth_user:${token}`);
    console.log("Cache lookup for auth_user:", cachedUser); // Debug
    if (cachedUser) {
      const cacheAge = await redisUtils.getClient().ttl(`auth_user:${token}`);
      if (cacheAge < 300) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        cachedUser = await User.findById(decoded.id).select("-password");
        if (cachedUser) {
          await redisUtils.setCache(`auth_user:${token}`, cachedUser, 3600);
        }
      }
      req.user = cachedUser;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded); // Debug
    const user = await User.findById(decoded.id).select("-password");
    console.log("User from DB:", user); // Debug

    if (!user) {
      return next(new ErrorResponse("Người dùng không tồn tại", 401));
    }

    await redisUtils.setCache(`auth_user:${token}`, user, 3600);
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error); // Debug
    if (error.name === "TokenExpiredError") {
      return next(
        new ErrorResponse("Token đã hết hạn, vui lòng đăng nhập lại", 401)
      );
    }
    return next(new ErrorResponse("Token không hợp lệ", 401));
  }
});

exports.checkRole = (roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return next(
        new ErrorResponse("Không có quyền truy cập, vui lòng đăng nhập", 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `Vai trò ${req.user.role} không có quyền truy cập tài nguyên này`,
          403
        )
      );
    }
    next();
  });
