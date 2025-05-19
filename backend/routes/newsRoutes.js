// backend/routes/newsRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getNewsSuggestions
} = require("../controllers/newsController");
const {
  authenticateToken,
  checkRole,
} = require("../middleware/authMiddleware");

router.get("/", getAllNews);
router.get("/suggestions", getNewsSuggestions); // Thêm route cho gợi ý
router.get("/:id", getNewsById);
router.post("/create", authenticateToken, checkRole(["admin"]), createNews);
router.put("/update/:id", authenticateToken, checkRole(["admin"]), updateNews);
router.delete("/:id", authenticateToken, checkRole(["admin"]), deleteNews);

module.exports = router;