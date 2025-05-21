// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

exports.authenticateToken = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.replace("Bearer ", "");
  }

  if (!token) {
    return next(new ErrorResponse("Không có token, vui lòng đăng nhập", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorResponse("Người dùng không tồn tại", 401));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse("Token không hợp lệ hoặc đã hết hạn", 401));
  }
});

exports.checkRole = (roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse("Không có quyền truy cập tài nguyên này", 403)
      );
    }
    next();
  });

// exports.logout = asyncHandler(async (req, res, next) => {
//   res.status(200).json({ success: true, message: "Đăng xuất thành công" });
// });
