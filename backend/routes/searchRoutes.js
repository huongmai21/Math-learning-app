// routes/searchRoutes.js
const express = require("express");
const router = express.Router();

// Giả lập dữ liệu (thay thế bằng truy vấn thực tế từ MySQL/MongoDB)
const mockData = {
  resources: [
    {
      id: 1,
      title: "Sách giáo khoa Toán lớp 6",
      description: "Sách giáo khoa Toán lớp 6 mới nhất",
      link: "/resources/textbooks/math-grade6",
      type: "Tài liệu",
    },
    {
      id: 2,
      title: "Đề thi Toán lớp 9",
      description: "Đề thi thử Toán lớp 9 năm 2025",
      link: "/exam/grade9",
      type: "Đề thi",
    },
  ],
  news: [
    {
      id: 1,
      title: "Cải cách giáo dục 2025",
      description: "Thông tin về cải cách giáo dục mới",
      link: "/news/education/1",
      type: "Tin tức",
    },
    {
      id: 2,
      title: "Tạp chí Toán số 10",
      description: "Tạp chí Toán học số mới nhất",
      link: "/news/magazine/10",
      type: "Tạp chí",
    },
  ],
  courses: [
    {
      id: 1,
      title: "Khóa học Toán lớp 10",
      description: "Khóa học Toán lớp 10 online",
      link: "/courses/math-grade10",
      type: "Khóa học",
    },
  ],
};

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.toLowerCase() : "";
    if (!query) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập từ khóa tìm kiếm" });
    }

    // Tìm kiếm trong tài liệu, tin tức, khóa học
    const results = [
      ...mockData.resources.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      ),
      ...mockData.news.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      ),
      ...mockData.courses.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      ),
    ];

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Lỗi server", details: error.message });
  }
});

module.exports = router;
