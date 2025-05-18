"use client"

import { useState, useEffect, useCallback } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import {
  getUsers,
  deleteUser,
  updateUserRole,
  getCourses,
  approveCourse,
  rejectCourse,
  deleteCourse,
  getExams,
  approveExam,
  rejectExam,
  deleteExam,
  getNews,
  approveNews,
  rejectNews,
  deleteNews,
  getDocuments,
  approveDocument,
  rejectDocument,
  deleteDocument,
  getBookmarks,
  deleteBookmark,
  getStats,
  getDetailedStats,
} from "../../services/adminService"
import "./AdminDashboard.css"

// Đăng ký các thành phần Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [exams, setExams] = useState([])
  const [news, setNews] = useState([])
  const [documents, setDocuments] = useState([])
  const [libraryItems, setBookmarks] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalCourses: 0,
    totalPosts: 0,
    totalDocuments: 0,
    totalNews: 0,
  })
  const [detailedStats, setDetailedStats] = useState(null)
  const [statsPeriod, setStatsPeriod] = useState("week")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Hàm fetch dữ liệu
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Tải dữ liệu dựa trên tab đang active
      switch (activeTab) {
        case "dashboard":
          const statsResponse = await getStats()
          setStats(
            statsResponse.data || {
              totalUsers: 0,
              totalExams: 0,
              totalCourses: 0,
              totalPosts: 0,
              totalDocuments: 0,
              totalNews: 0,
            },
          )

          const detailedStatsResponse = await getDetailedStats(statsPeriod)
          setDetailedStats(detailedStatsResponse.data || null)
          break
        case "users":
          const usersResponse = await getUsers()
          setUsers(usersResponse.data.users || [])
          break
        case "courses":
          const coursesResponse = await getCourses()
          setCourses(coursesResponse.data.courses || [])
          break
        case "exams":
          const examsResponse = await getExams()
          setExams(examsResponse.data.exams || [])
          break
        case "news":
          const newsResponse = await getNews()
          setNews(newsResponse.data.news || [])
          break
        case "documents":
          const documentsResponse = await getDocuments()
          setDocuments(documentsResponse.data.documents || [])
          break
        case "library":
          const libraryResponse = await getBookmarks()
          setBookmarks(libraryResponse.data.items || [])
          break
        default:
          break
      }
    } catch (err) {
      setError("Không thể tải dữ liệu!")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [activeTab, statsPeriod])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Xử lý người dùng
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return

    try {
      await deleteUser(userId)
      setUsers(users.filter((u) => u._id !== userId))
      toast.success("Xóa người dùng thành công!")
    } catch (err) {
      toast.error("Xóa người dùng thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await updateUserRole(userId, role)
      setUsers(users.map((u) => (u._id === userId ? { ...u, role } : u)))
      toast.success("Cập nhật vai trò người dùng thành công!")
    } catch (err) {
      toast.error("Cập nhật vai trò thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  // Xử lý khóa học
  const handleApproveCourse = async (courseId) => {
    try {
      const response = await approveCourse(courseId)
      setCourses(courses.map((course) => (course._id === courseId ? response.data.course : course)))
      toast.success("Duyệt khóa học thành công!")
    } catch (err) {
      toast.error("Duyệt khóa học thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  const handleRejectCourse = async (courseId) => {
    try {
      const response = await rejectCourse(courseId)
      setCourses(courses.map((course) => (course._id === courseId ? response.data.course : course)))
      toast.success("Từ chối khóa học thành công!")
    } catch (err) {
      toast.error("Từ chối khóa học thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return

    try {
      await deleteCourse(courseId)
      setCourses(courses.filter((course) => course._id !== courseId))
      toast.success("Xóa khóa học thành công!")
    } catch (err) {
      toast.error("Xóa khóa học thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  // Xử lý đề thi
  const handleApproveExam = async (examId) => {
    try {
      const response = await approveExam(examId)
      setExams(exams.map((exam) => (exam._id === examId ? response.data.exam : exam)))
      toast.success("Duyệt đề thi thành công!")
    } catch (err) {
      toast.error("Duyệt đề thi thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  const handleRejectExam = async (examId) => {
    try {
      const response = await rejectExam(examId)
      setExams(exams.map((exam) => (exam._id === examId ? response.data.exam : exam)))
      toast.success("Từ chối đề thi thành công!")
    } catch (err) {
      toast.error("Từ chối đề thi thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return

    try {
      await deleteExam(examId)
      setExams(exams.filter((exam) => exam._id !== examId))
      toast.success("Xóa đề thi thành công!")
    } catch (err) {
      toast.error("Xóa đề thi thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  // Xử lý tin tức
  const handleApproveNews = async (newsId) => {
    try {
      const response = await approveNews(newsId)
      setNews(news.map((item) => (item._id === newsId ? response.data.news : item)))
      toast.success("Duyệt tin tức thành công!")
    } catch (err) {
      toast.error("Duyệt tin tức thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  const handleRejectNews = async (newsId) => {
    try {
      const response = await rejectNews(newsId)
      setNews(news.map((item) => (item._id === newsId ? response.data.news : item)))
      toast.success("Từ chối tin tức thành công!")
    } catch (err) {
      toast.error("Từ chối tin tức thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tin tức này?")) return

    try {
      await deleteNews(newsId)
      setNews(news.filter((item) => item._id !== newsId))
      toast.success("Xóa tin tức thành công!")
    } catch (err) {
      toast.error("Xóa tin tức thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  // Xử lý tài liệu
  const handleApproveDocument = async (documentId) => {
    try {
      const response = await approveDocument(documentId)
      setDocuments(documents.map((doc) => (doc._id === documentId ? response.data.document : doc)))
      toast.success("Duyệt tài liệu thành công!")
    } catch (err) {
      toast.error("Duyệt tài liệu thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  const handleRejectDocument = async (documentId) => {
    try {
      const response = await rejectDocument(documentId)
      setDocuments(documents.map((doc) => (doc._id === documentId ? response.data.document : doc)))
      toast.success("Từ chối tài liệu thành công!")
    } catch (err) {
      toast.error("Từ chối tài liệu thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return

    try {
      await deleteDocument(documentId)
      setDocuments(documents.filter((doc) => doc._id !== documentId))
      toast.success("Xóa tài liệu thành công!")
    } catch (err) {
      toast.error("Xóa tài liệu thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  // Xử lý thư viện
  const handleDeleteBookmark = async (itemId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này khỏi thư viện?")) return

    try {
      await deleteBookmark(itemId)
      setBookmarks(libraryItems.filter((item) => item._id !== itemId))
      toast.success("Xóa mục thư viện thành công!")
    } catch (err) {
      toast.error("Xóa mục thư viện thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  // Xử lý thống kê
  const handleStatsPeriodChange = (e) => {
    setStatsPeriod(e.target.value)
  }

  // Xử lý tìm kiếm và lọc
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value)
    setCurrentPage(1)
  }

  // Xử lý phân trang
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // Lọc dữ liệu theo tìm kiếm và trạng thái
  const getFilteredData = (data, type) => {
    let filteredData = [...data]

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()

      switch (type) {
        case "users":
          filteredData = filteredData.filter(
            (item) =>
              item.username?.toLowerCase().includes(searchLower) || item.email?.toLowerCase().includes(searchLower),
          )
          break
        case "courses":
        case "exams":
        case "news":
        case "documents":
          filteredData = filteredData.filter(
            (item) =>
              item.title?.toLowerCase().includes(searchLower) || item.description?.toLowerCase().includes(searchLower),
          )
          break
        case "library":
          filteredData = filteredData.filter((item) => item.title?.toLowerCase().includes(searchLower))
          break
        default:
          break
      }
    }

    // Lọc theo trạng thái
    if (filterStatus !== "all" && ["courses", "exams", "news", "documents"].includes(type)) {
      filteredData = filteredData.filter((item) => item.status === filterStatus)
    }

    return filteredData
  }

  // Phân trang dữ liệu
  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }

  // Tạo dữ liệu biểu đồ
  const createChartData = () => {
    if (!detailedStats) return null

    // Dữ liệu biểu đồ người dùng mới
    const newUsersData = {
      labels: detailedStats.newUsers.map((item) => item.date),
      datasets: [
        {
          label: "Người dùng mới",
          data: detailedStats.newUsers.map((item) => item.count),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    }

    // Dữ liệu biểu đồ hoạt động
    const activitiesData = {
      labels: detailedStats.activities.map((item) => item.date),
      datasets: [
        {
          label: "Hoạt động",
          data: detailedStats.activities.map((item) => item.count),
          borderColor: "rgba(153, 102, 255, 1)",
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    }

    // Dữ liệu biểu đồ tròn phân phối nội dung
    const contentDistributionData = {
      labels: ["Khóa học", "Đề thi", "Tài liệu", "Tin tức", "Bài đăng"],
      datasets: [
        {
          data: [stats.totalCourses, stats.totalExams, stats.totalDocuments, stats.totalNews, stats.totalPosts],
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
          ],
          borderWidth: 1,
        },
      ],
    }

    return {
      newUsersData,
      activitiesData,
      contentDistributionData,
    }
  }

  // Tạo options cho biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  // Kiểm tra quyền truy cập
  if (!user || user.role !== "admin") {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <i className="fas fa-lock access-denied-icon"></i>
          <h2>Không có quyền truy cập</h2>
          <p>Bạn không có quyền truy cập trang quản trị hệ thống.</p>
          <a href="/" className="back-home-btn">
            Quay lại trang chủ
          </a>
        </div>
      </div>
    )
  }

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="admin-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h2>Đã xảy ra lỗi</h2>
        <p>{error}</p>
        <button onClick={fetchData} className="retry-btn">
          Thử lại
        </button>
      </div>
    )
  }

  // Tạo dữ liệu biểu đồ
  const chartData = createChartData()

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <i className="fas fa-cogs"></i>
          <h2>Quản trị hệ thống</h2>
        </div>
        <ul className="admin-menu">
          <li className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
            <i className="fas fa-tachometer-alt"></i>
            <span>Tổng quan</span>
          </li>
          <li className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
            <i className="fas fa-users"></i>
            <span>Quản lý người dùng</span>
          </li>
          <li className={activeTab === "courses" ? "active" : ""} onClick={() => setActiveTab("courses")}>
            <i className="fas fa-graduation-cap"></i>
            <span>Quản lý khóa học</span>
          </li>
          <li className={activeTab === "exams" ? "active" : ""} onClick={() => setActiveTab("exams")}>
            <i className="fas fa-file-alt"></i>
            <span>Quản lý đề thi</span>
          </li>
          <li className={activeTab === "news" ? "active" : ""} onClick={() => setActiveTab("news")}>
            <i className="fas fa-newspaper"></i>
            <span>Quản lý tin tức</span>
          </li>
          <li className={activeTab === "documents" ? "active" : ""} onClick={() => setActiveTab("documents")}>
            <i className="fas fa-book"></i>
            <span>Quản lý tài liệu</span>
          </li>
          <li className={activeTab === "library" ? "active" : ""} onClick={() => setActiveTab("library")}>
            <i className="fas fa-bookmark"></i>
            <span>Quản lý thư viện</span>
          </li>
        </ul>
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <img
              src={
                user.avatar || "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png"
              }
              alt="Admin avatar"
              className="admin-avatar"
            />
            <div>
              <p className="admin-username">{user.username}</p>
              <p className="admin-role">Quản trị viên</p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {/* Tổng quan */}
        {activeTab === "dashboard" && (
          <div className="dashboard-tab">
            <div className="admin-header">
              <h2>Tổng quan hệ thống</h2>
              <div className="admin-actions">
                <select value={statsPeriod} onChange={handleStatsPeriodChange} className="period-selector">
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                  <option value="year">365 ngày qua</option>
                </select>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon users-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <h3>Người dùng</h3>
                  <p className="stat-value">{stats.totalUsers || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon courses-icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <div className="stat-info">
                  <h3>Khóa học</h3>
                  <p className="stat-value">{stats.totalCourses || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon exams-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="stat-info">
                  <h3>Đề thi</h3>
                  <p className="stat-value">{stats.totalExams || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon documents-icon">
                  <i className="fas fa-book"></i>
                </div>
                <div className="stat-info">
                  <h3>Tài liệu</h3>
                  <p className="stat-value">{stats.totalDocuments || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon news-icon">
                  <i className="fas fa-newspaper"></i>
                </div>
                <div className="stat-info">
                  <h3>Tin tức</h3>
                  <p className="stat-value">{stats.totalNews || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon posts-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <div className="stat-info">
                  <h3>Bài đăng</h3>
                  <p className="stat-value">{stats.totalPosts || 0}</p>
                </div>
              </div>
            </div>

            {chartData && (
              <div className="charts-container">
                <div className="chart-wrapper">
                  <h3>Người dùng mới</h3>
                  <div className="chart">
                    <Line data={chartData.newUsersData} options={chartOptions} />
                  </div>
                </div>
                <div className="chart-wrapper">
                  <h3>Hoạt động</h3>
                  <div className="chart">
                    <Bar data={chartData.activitiesData} options={chartOptions} />
                  </div>
                </div>
                <div className="chart-wrapper">
                  <h3>Phân phối nội dung</h3>
                  <div className="chart donut-chart">
                    <Doughnut
                      data={chartData.contentDistributionData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quản lý người dùng */}
        {activeTab === "users" && (
          <div className="users-tab">
            <div className="admin-header">
              <h2>Quản lý người dùng</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Tên người dùng</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(users, "users")).map((u) => (
                    <tr key={u._id}>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                          disabled={u._id === user._id}
                          className="role-select"
                        >
                          <option value="student">Học sinh</option>
                          <option value="teacher">Giáo viên</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={u._id === user._id}
                          className="delete-btn"
                          title="Xóa người dùng"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {getFilteredData(users, "users").length === 0 && (
              <div className="no-data">
                <i className="fas fa-search"></i>
                <p>Không tìm thấy người dùng nào</p>
              </div>
            )}

            {getFilteredData(users, "users").length > itemsPerPage && (
              <div className="pagination">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="pagination-btn">
                  <i className="fas fa-angle-double-left"></i>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-left"></i>
                </button>
                <span className="pagination-info">
                  Trang {currentPage} / {Math.ceil(getFilteredData(users, "users").length / itemsPerPage)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(getFilteredData(users, "users").length / itemsPerPage)}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-right"></i>
                </button>
                <button
                  onClick={() => handlePageChange(Math.ceil(getFilteredData(users, "users").length / itemsPerPage))}
                  disabled={currentPage === Math.ceil(getFilteredData(users, "users").length / itemsPerPage)}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quản lý khóa học */}
        {activeTab === "courses" && (
          <div className="courses-tab">
            <div className="admin-header">
              <h2>Quản lý khóa học</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select value={filterStatus} onChange={handleFilterChange} className="filter-select">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                  </select>
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>Giá</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(courses, "courses")).map((course) => (
                    <tr key={course._id}>
                      <td>{course.title}</td>
                      <td>{course.author?.username || "Không xác định"}</td>
                      <td>{course.price ? `${course.price.toLocaleString("vi-VN")} VND` : "Miễn phí"}</td>
                      <td>
                        <span className={`status-badge status-${course.status}`}>
                          {course.status === "pending"
                            ? "Chờ duyệt"
                            : course.status === "approved"
                              ? "Đã duyệt"
                              : "Bị từ chối"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {course.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveCourse(course._id)}
                                className="approve-btn"
                                title="Duyệt khóa học"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                onClick={() => handleRejectCourse(course._id)}
                                className="reject-btn"
                                title="Từ chối khóa học"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="delete-btn"
                            title="Xóa khóa học"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {getFilteredData(courses, "courses").length === 0 && (
              <div className="no-data">
                <i className="fas fa-search"></i>
                <p>Không tìm thấy khóa học nào</p>
              </div>
            )}

            {getFilteredData(courses, "courses").length > itemsPerPage && (
              <div className="pagination">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="pagination-btn">
                  <i className="fas fa-angle-double-left"></i>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-left"></i>
                </button>
                <span className="pagination-info">
                  Trang {currentPage} / {Math.ceil(getFilteredData(courses, "courses").length / itemsPerPage)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(getFilteredData(courses, "courses").length / itemsPerPage)}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-right"></i>
                </button>
                <button
                  onClick={() => handlePageChange(Math.ceil(getFilteredData(courses, "courses").length / itemsPerPage))}
                  disabled={currentPage === Math.ceil(getFilteredData(courses, "courses").length / itemsPerPage)}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quản lý đề thi */}
        {activeTab === "exams" && (
          <div className="exams-tab">
            <div className="admin-header">
              <h2>Quản lý đề thi</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm đề thi..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select value={filterStatus} onChange={handleFilterChange} className="filter-select">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                  </select>
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>Cấp học</th>
                    <th>Môn học</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(exams, "exams")).map((exam) => (
                    <tr key={exam._id}>
                      <td>{exam.title}</td>
                      <td>{exam.author?.username || "Không xác định"}</td>
                      <td>
                        {exam.educationLevel === "university"
                          ? "Đại học"
                          : `Lớp ${exam.educationLevel.replace("grade", "")}`}
                      </td>
                      <td>{exam.subject === "math" ? "Toán" : exam.subject}</td>
                      <td>
                        <span className={`status-badge status-${exam.status}`}>
                          {exam.status === "pending"
                            ? "Chờ duyệt"
                            : exam.status === "approved"
                              ? "Đã duyệt"
                              : "Bị từ chối"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {exam.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveExam(exam._id)}
                                className="approve-btn"
                                title="Duyệt đề thi"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                onClick={() => handleRejectExam(exam._id)}
                                className="reject-btn"
                                title="Từ chối đề thi"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDeleteExam(exam._id)} className="delete-btn" title="Xóa đề thi">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {getFilteredData(exams, "exams").length === 0 && (
              <div className="no-data">
                <i className="fas fa-search"></i>
                <p>Không tìm thấy đề thi nào</p>
              </div>
            )}

            {getFilteredData(exams, "exams").length > itemsPerPage && (
              <div className="pagination">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="pagination-btn">
                  <i className="fas fa-angle-double-left"></i>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-left"></i>
                </button>
                <span className="pagination-info">
                  Trang {currentPage} / {Math.ceil(getFilteredData(exams, "exams").length / itemsPerPage)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(getFilteredData(exams, "exams").length / itemsPerPage)}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-right"></i>
                </button>
                <button
                  onClick={() => handlePageChange(Math.ceil(getFilteredData(exams, "exams").length / itemsPerPage))}
                  disabled={currentPage === Math.ceil(getFilteredData(exams, "exams").length / itemsPerPage)}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quản lý tin tức */}
        {activeTab === "news" && (
          <div className="news-tab">
            <div className="admin-header">
              <h2>Quản lý tin tức</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm tin tức..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select value={filterStatus} onChange={handleFilterChange} className="filter-select">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                  </select>
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>Danh mục</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(news, "news")).map((item) => (
                    <tr key={item._id}>
                      <td>{item.title}</td>
                      <td>{item.author?.username || "Không xác định"}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`status-badge status-${item.status}`}>
                          {item.status === "pending"
                            ? "Chờ duyệt"
                            : item.status === "approved"
                              ? "Đã duyệt"
                              : "Bị từ chối"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {item.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveNews(item._id)}
                                className="approve-btn"
                                title="Duyệt tin tức"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                onClick={() => handleRejectNews(item._id)}
                                className="reject-btn"
                                title="Từ chối tin tức"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDeleteNews(item._id)} className="delete-btn" title="Xóa tin tức">
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {getFilteredData(news, "news").length === 0 && (
              <div className="no-data">
                <i className="fas fa-search"></i>
                <p>Không tìm thấy tin tức nào</p>
              </div>
            )}

            {getFilteredData(news, "news").length > itemsPerPage && (
              <div className="pagination">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="pagination-btn">
                  <i className="fas fa-angle-double-left"></i>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-left"></i>
                </button>
                <span className="pagination-info">
                  Trang {currentPage} / {Math.ceil(getFilteredData(news, "news").length / itemsPerPage)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(getFilteredData(news, "news").length / itemsPerPage)}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-right"></i>
                </button>
                <button
                  onClick={() => handlePageChange(Math.ceil(getFilteredData(news, "news").length / itemsPerPage))}
                  disabled={currentPage === Math.ceil(getFilteredData(news, "news").length / itemsPerPage)}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quản lý tài liệu */}
        {activeTab === "documents" && (
          <div className="documents-tab">
            <div className="admin-header">
              <h2>Quản lý tài liệu</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm tài liệu..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                  <select value={filterStatus} onChange={handleFilterChange} className="filter-select">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Bị từ chối</option>
                  </select>
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>Cấp học</th>
                    <th>Loại tài liệu</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(documents, "documents")).map((doc) => (
                    <tr key={doc._id}>
                      <td>{doc.title}</td>
                      <td>{doc.uploadedBy?.username || "Không xác định"}</td>
                      <td>
                        {doc.educationLevel === "university"
                          ? "Đại học"
                          : doc.educationLevel === "primary"
                            ? "Cấp 1"
                            : doc.educationLevel === "secondary"
                              ? "Cấp 2"
                              : "Cấp 3"}
                      </td>
                      <td>{doc.documentType}</td>
                      <td>
                        <span className={`status-badge status-${doc.status}`}>
                          {doc.status === "pending"
                            ? "Chờ duyệt"
                            : doc.status === "approved" || doc.status === "published"
                              ? "Đã duyệt"
                              : "Bị từ chối"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {doc.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApproveDocument(doc._id)}
                                className="approve-btn"
                                title="Duyệt tài liệu"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                              <button
                                onClick={() => handleRejectDocument(doc._id)}
                                className="reject-btn"
                                title="Từ chối tài liệu"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteDocument(doc._id)}
                            className="delete-btn"
                            title="Xóa tài liệu"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {getFilteredData(documents, "documents").length === 0 && (
              <div className="no-data">
                <i className="fas fa-search"></i>
                <p>Không tìm thấy tài liệu nào</p>
              </div>
            )}

            {getFilteredData(documents, "documents").length > itemsPerPage && (
              <div className="pagination">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="pagination-btn">
                  <i className="fas fa-angle-double-left"></i>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-left"></i>
                </button>
                <span className="pagination-info">
                  Trang {currentPage} / {Math.ceil(getFilteredData(documents, "documents").length / itemsPerPage)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(getFilteredData(documents, "documents").length / itemsPerPage)}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-right"></i>
                </button>
                <button
                  onClick={() =>
                    handlePageChange(Math.ceil(getFilteredData(documents, "documents").length / itemsPerPage))
                  }
                  disabled={currentPage === Math.ceil(getFilteredData(documents, "documents").length / itemsPerPage)}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quản lý thư viện */}
        {activeTab === "library" && (
          <div className="library-tab">
            <div className="admin-header">
              <h2>Quản lý thư viện</h2>
              <div className="admin-actions">
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Tìm kiếm mục thư viện..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
                <button onClick={fetchData} className="refresh-btn">
                  <i className="fas fa-sync-alt"></i> Làm mới
                </button>
              </div>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Loại</th>
                    <th>Người lưu</th>
                    <th>Ngày lưu</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedData(getFilteredData(libraryItems, "library")).map((item) => (
                    <tr key={item._id}>
                      <td>{item.title}</td>
                      <td>{item.type === "document" ? "Tài liệu" : "Tin tức"}</td>
                      <td>{item.user?.username || "Không xác định"}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString("vi-VN")}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteBookmark(item._id)}
                          className="delete-btn"
                          title="Xóa mục thư viện"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {getFilteredData(libraryItems, "library").length === 0 && (
              <div className="no-data">
                <i className="fas fa-search"></i>
                <p>Không tìm thấy mục thư viện nào</p>
              </div>
            )}

            {getFilteredData(libraryItems, "library").length > itemsPerPage && (
              <div className="pagination">
                <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="pagination-btn">
                  <i className="fas fa-angle-double-left"></i>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-left"></i>
                </button>
                <span className="pagination-info">
                  Trang {currentPage} / {Math.ceil(getFilteredData(libraryItems, "library").length / itemsPerPage)}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(getFilteredData(libraryItems, "library").length / itemsPerPage)}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-right"></i>
                </button>
                <button
                  onClick={() =>
                    handlePageChange(Math.ceil(getFilteredData(libraryItems, "library").length / itemsPerPage))
                  }
                  disabled={currentPage === Math.ceil(getFilteredData(libraryItems, "library").length / itemsPerPage)}
                  className="pagination-btn"
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
