// middleware/roleMiddleware.js

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Không có quyền truy cập." });
    }
    next();
  };
};

module.exports = checkRole;
