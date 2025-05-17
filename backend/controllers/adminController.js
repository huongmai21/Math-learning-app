const User = require("../models/User")
const Exam = require("../models/Exam")
const Bookmark = require("../models/Bookmark")
const Course = require("../models/Course")
const Post = require("../models/Post")
const News = require("../models/News")
const Document = require("../models/Document")
const asyncHandler = require("../middleware/asyncHandler")

// Quản lý người dùng
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("username email role createdAt")
  res.json({ users })
})

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" })

  await user.remove()
  res.json({ message: "Xóa người dùng thành công" })
})

exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  if (!["student", "teacher", "admin"].includes(role)) {
    return res.status(400).json({ message: "Vai trò không hợp lệ" })
  }

  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" })

  user.role = role
  await user.save()

  res.json({ message: "Cập nhật vai trò thành công", user })
})

// Quản lý khóa học
exports.getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate("author", "username")
  res.json({ courses })
})

exports.approveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" })

  course.status = "approved"
  await course.save()

  res.json({ message: "Duyệt khóa học thành công", course })
})

exports.rejectCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" })

  course.status = "rejected"
  await course.save()

  res.json({ message: "Từ chối khóa học thành công", course })
})

exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
  if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" })

  await course.remove()
  res.json({ message: "Xóa khóa học thành công" })
})

// Quản lý đề thi
exports.getExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find().populate("author", "username")
  res.json({ exams })
})

exports.approveExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)
  if (!exam) return res.status(404).json({ message: "Không tìm thấy đề thi" })

  exam.status = "approved"
  await exam.save()

  res.json({ message: "Duyệt đề thi thành công", exam })
})

exports.rejectExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)
  if (!exam) return res.status(404).json({ message: "Không tìm thấy đề thi" })

  exam.status = "rejected"
  await exam.save()

  res.json({ message: "Từ chối đ�� thi thành công", exam })
})

exports.deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id)
  if (!exam) return res.status(404).json({ message: "Không tìm thấy đề thi" })

  await exam.remove()
  res.json({ message: "Xóa đề thi thành công" })
})

// Quản lý tin tức
exports.getNews = asyncHandler(async (req, res) => {
  const news = await News.find().populate("author", "username")
  res.json({ news })
})

exports.approveNews = asyncHandler(async (req, res) => {
  const newsItem = await News.findById(req.params.id)
  if (!newsItem) return res.status(404).json({ message: "Không tìm thấy tin tức" })

  newsItem.status = "approved"
  await newsItem.save()

  res.json({ message: "Duyệt tin tức thành công", news: newsItem })
})

exports.rejectNews = asyncHandler(async (req, res) => {
  const newsItem = await News.findById(req.params.id)
  if (!newsItem) return res.status(404).json({ message: "Không tìm thấy tin tức" })

  newsItem.status = "rejected"
  await newsItem.save()

  res.json({ message: "Từ chối tin tức thành công", news: newsItem })
})

exports.deleteNews = asyncHandler(async (req, res) => {
  const newsItem = await News.findById(req.params.id)
  if (!newsItem) return res.status(404).json({ message: "Không tìm thấy tin tức" })

  await newsItem.remove()
  res.json({ message: "Xóa tin tức thành công" })
})

// Quản lý tài liệu
exports.getDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find().populate("author", "username")
  res.json({ documents })
})

exports.approveDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id)
  if (!document) return res.status(404).json({ message: "Không tìm thấy tài liệu" })

  document.status = "approved"
  await document.save()

  res.json({ message: "Duyệt tài liệu thành công", document })
})

exports.rejectDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id)
  if (!document) return res.status(404).json({ message: "Không tìm thấy tài liệu" })

  document.status = "rejected"
  await document.save()

  res.json({ message: "Từ chối tài liệu thành công", document })
})

exports.deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id)
  if (!document) return res.status(404).json({ message: "Không tìm thấy tài liệu" })

  await document.remove()
  res.json({ message: "Xóa tài liệu thành công" })
})

// Quản lý thư viện
exports.getBookmarks = asyncHandler(async (req, res) => {
  const items = await Bookmark.find().populate("user", "username")
  res.json({ items })
})

exports.deleteBookmark = asyncHandler(async (req, res) => {
  const item = await Bookmark.findById(req.params.id)
  if (!item) return res.status(404).json({ message: "Không tìm thấy mục thư viện" })

  await item.remove()
  res.json({ message: "Xóa mục thư viện thành công" })
})

// Thống kê
exports.getStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments()
  const totalExams = await Exam.countDocuments()
  const totalCourses = await Course.countDocuments()
  const totalPosts = await Post.countDocuments()
  const totalDocuments = await Document.countDocuments()
  const totalNews = await News.countDocuments()

  res.json({
    totalUsers,
    totalExams,
    totalCourses,
    totalPosts,
    totalDocuments,
    totalNews,
  })
})

// Thống kê chi tiết
exports.getDetailedStats = asyncHandler(async (req, res) => {
  const { period } = req.query
  let days = 7 // mặc định 7 ngày

  if (period === "month") {
    days = 30
  } else if (period === "year") {
    days = 365
  }

  // Tính ngày bắt đầu
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Thống kê người dùng mới
  const newUsers = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        date: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ])

  // Thống kê hoạt động (ví dụ: bài đăng, bình luận, v.v.)
  const activities = await Post.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $project: {
        date: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ])

  res.json({
    newUsers,
    activities,
  })
})
