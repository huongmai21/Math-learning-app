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

  if (!token) {
    return next(new ErrorResponse("Không có token, vui lòng đăng nhập", 401));
  }

  try {
    const isBlacklisted = await redisUtils.getCache(`bl_token:${token}`);
    if (isBlacklisted) {
      return next(new ErrorResponse("Token không hợp lệ hoặc đã hết hạn", 401));
    }

    let cachedUser = await redisUtils.getCache(`auth_user:${token}`);
    if (cachedUser) {
      const cacheAge = await redisUtils.getClient().ttl(`auth_user:${token}`);
      if (cacheAge < 300) {
        // Làm mới cache nếu còn dưới 5 phút
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
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new ErrorResponse("Người dùng không tồn tại", 401));
    }

    await redisUtils.setCache(`auth_user:${token}`, user, 3600);
    req.user = user;
    next();
  } catch (error) {
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

exports.logout = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token) {
    await redisUtils.setCache(
      `bl_token:${token}`,
      true,
      Number.parseInt(process.env.JWT_EXPIRE) || 86400
    );
    await redisUtils.getClient().del(`auth_user:${token}`);
    if (global.io) {
      global.io
        .to(req.user._id.toString())
        .emit("logout", { message: "Bạn đã đăng xuất" });
    }
  }

  res.status(200).json({ success: true, message: "Đăng xuất thành công" });
});
