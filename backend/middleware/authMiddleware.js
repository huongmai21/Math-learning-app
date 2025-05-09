// middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        console.warn("No token provided in Authorization header");
        return res.status(401).json({ message: "Không có token, vui lòng đăng nhập!" });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log(`Authenticated user: ${decoded.id}`);
      next();
    } catch (err) {
      console.error("Auth middleware error:", {
        message: err.message,
        stack: err.stack,
        token: req.header("Authorization")?.substring(0, 10) + "...",
      });
      return res.status(401).json({ message: "Token không hợp lệ!" });
    }
  }
};

module.exports = authenticateToken;
