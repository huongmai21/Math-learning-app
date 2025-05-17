"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
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

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState("users")
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Tải dữ liệu dựa trên tab đang active
        switch (activeTab) {
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
          case "stats":
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
          default:
            break
        }
      } catch (err) {
        setError("Không thể tải dữ liệu!")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab, statsPeriod])

  // Xử lý người dùng
  const handleDeleteUser = async (userId) => {
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
      const response = await updateUserRole(userId, role)
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
    try {
      await deleteBookmark(itemId)
      setBookmarks(libraryItems.filter((item) => item._id !== itemId))
      toast.success("Xóa tài liệu/tin tức thành công!")
    } catch (err) {
      toast.error("Xóa tài liệu/tin tức thất bại: " + (err.message || "Vui lòng thử lại."))
    }
  }

  // Xử lý thống kê
  const handleStatsPeriodChange = (e) => {
    setStatsPeriod(e.target.value)
  }

  if (!user || user.role !== "admin") {
    return <div className="access-denied">Bạn không có quyền truy cập trang này.</div>
  }

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>Quản trị viên</h2>
        <ul className="admin-menu">
          <li className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
            Quản lý người dùng
          </li>
          <li className={activeTab === "courses" ? "active" : ""} onClick={() => setActiveTab("courses")}>
            Quản lý khóa học
          </li>
          <li className={activeTab === "exams" ? "active" : ""} onClick={() => setActiveTab("exams")}>
            Quản lý đề thi
          </li>
          <li className={activeTab === "news" ? "active" : ""} onClick={() => setActiveTab("news")}>
            Quản lý tin tức
          </li>
          <li className={activeTab === "documents" ? "active" : ""} onClick={() => setActiveTab("documents")}>
            Quản lý tài liệu
          </li>
          <li className={activeTab === "library" ? "active" : ""} onClick={() => setActiveTab("library")}>
            Quản lý thư viện
          </li>
          <li className={activeTab === "stats" ? "active" : ""} onClick={() => setActiveTab("stats")}>
            Thống kê hệ thống
          </li>
        </ul>
      </div>

      <div className="dashboard-content">
        {/* Tab quản lý người dùng */}
        {activeTab === "users" && (
          <div className="users-tab">
            <h3>Quản lý người dùng</h3>
            <div className="user-list">
              {users.length > 0 ? (
                users.map((u) => (
                  <div key={u._id} className="user-item">
                    <div className="user-info">
                      <h4>{u.username}</h4>
                      <p>Email: {u.email}</p>
                      <p>
                        Vai trò:{" "}
                        {u.role === "admin" ? "Quản trị viên" : u.role === "teacher" ? "Giáo viên" : "Học sinh"}
                      </p>
                    </div>
                    <div className="user-actions">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                        disabled={u._id === user._id}
                      >
                        <option value="student">Học sinh</option>
                        <option value="teacher">Giáo viên</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={u._id === user._id}
                        className="delete-btn"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">Chưa có người dùng nào.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab quản lý khóa học */}
        {activeTab === "courses" && (
          <div className="courses-tab">
            <h3>Quản lý khóa học</h3>
            <div className="course-list">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <div key={course._id} className="course-item">
                    <div className="course-info">
                      <h4>{course.title}</h4>
                      <p>Tác giả: {course.author?.username || "Không xác định"}</p>
                      <p>Giá: {course.price ? `${course.price.toLocaleString("vi-VN")} VND` : "Miễn phí"}</p>
                      <p>
                        Trạng thái:{" "}
                        {course.status === "pending"
                          ? "Chờ duyệt"
                          : course.status === "approved"
                            ? "Đã duyệt"
                            : "Bị từ chối"}
                      </p>
                    </div>
                    <div className="course-actions">
                      {course.status === "pending" && (
                        <>
                          <button onClick={() => handleApproveCourse(course._id)} className="approve-btn">
                            Duyệt
                          </button>
                          <button onClick={() => handleRejectCourse(course._id)} className="reject-btn">
                            Từ chối
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDeleteCourse(course._id)} className="delete-btn">
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">Chưa có khóa học nào.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab quản lý đề thi */}
        {activeTab === "exams" && (
          <div className="exams-tab">
            <h3>Quản lý đề thi</h3>
            <div className="exam-list">
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <div key={exam._id} className="exam-item">
                    <div className="exam-info">
                      <h4>{exam.title}</h4>
                      <p>Tác giả: {exam.author?.username || "Không xác định"}</p>
                      <p>
                        Cấp học:{" "}
                        {exam.educationLevel === "university"
                          ? "Đại học"
                          : `Lớp ${exam.educationLevel.replace("grade", "")}`}
                      </p>
                      <p>Môn: {exam.subject === "math" ? "Toán" : exam.subject}</p>
                      <p>
                        Trạng thái:{" "}
                        {exam.status === "pending"
                          ? "Chờ duyệt"
                          : exam.status === "approved"
                            ? "Đã duyệt"
                            : "Bị từ chối"}
                      </p>
                    </div>
                    <div className="exam-actions">
                      {exam.status === "pending" && (
                        <>
                          <button onClick={() => handleApproveExam(exam._id)} className="approve-btn">
                            Duyệt
                          </button>
                          <button onClick={() => handleRejectExam(exam._id)} className="reject-btn">
                            Từ chối
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDeleteExam(exam._id)} className="delete-btn">
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">Chưa có đề thi nào.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab quản lý tin tức */}
        {activeTab === "news" && (
          <div className="news-tab">
            <h3>Quản lý tin tức</h3>
            <div className="news-list">
              {news.length > 0 ? (
                news.map((item) => (
                  <div key={item._id} className="news-item">
                    <div className="news-info">
                      <h4>{item.title}</h4>
                      <p>Tác giả: {item.author?.username || "Không xác định"}</p>
                      <p>Danh mục: {item.category}</p>
                      <p>
                        Trạng thái:{" "}
                        {item.status === "pending"
                          ? "Chờ duyệt"
                          : item.status === "approved"
                            ? "Đã duyệt"
                            : "Bị từ chối"}
                      </p>
                    </div>
                    <div className="news-actions">
                      {item.status === "pending" && (
                        <>
                          <button onClick={() => handleApproveNews(item._id)} className="approve-btn">
                            Duyệt
                          </button>
                          <button onClick={() => handleRejectNews(item._id)} className="reject-btn">
                            Từ chối
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDeleteNews(item._id)} className="delete-btn">
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">Chưa có tin tức nào.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab quản lý tài liệu */}
        {activeTab === "documents" && (
          <div className="documents-tab">
            <h3>Quản lý tài liệu</h3>
            <div className="document-list">
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div key={doc._id} className="document-item">
                    <div className="document-info">
                      <h4>{doc.title}</h4>
                      <p>Tác giả: {doc.author?.username || "Không xác định"}</p>
                      <p>
                        Cấp học:{" "}
                        {doc.educationLevel === "university"
                          ? "Đại học"
                          : `Lớp ${doc.educationLevel.replace("grade", "")}`}
                      </p>
                      <p>Môn: {doc.subject === "math" ? "Toán" : doc.subject}</p>
                      <p>
                        Trạng thái:{" "}
                        {doc.status === "pending" ? "Chờ duyệt" : doc.status === "approved" ? "Đã duyệt" : "Bị từ chối"}
                      </p>
                    </div>
                    <div className="document-actions">
                      {doc.status === "pending" && (
                        <>
                          <button onClick={() => handleApproveDocument(doc._id)} className="approve-btn">
                            Duyệt
                          </button>
                          <button onClick={() => handleRejectDocument(doc._id)} className="reject-btn">
                            Từ chối
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDeleteDocument(doc._id)} className="delete-btn">
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">Chưa có tài liệu nào.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab quản lý thư viện */}
        {activeTab === "library" && (
          <div className="library-tab">
            <h3>Quản lý thư viện</h3>
            <div className="library-list">
              {libraryItems.length > 0 ? (
                libraryItems.map((item) => (
                  <div key={item._id} className="library-item">
                    <div className="library-info">
                      <h4>{item.title}</h4>
                      <p>Loại: {item.type === "document" ? "Tài liệu" : "Tin tức"}</p>
                      <p>Người lưu: {item.user?.username || "Không xác định"}</p>
                    </div>
                    <div className="library-actions">
                      <button onClick={() => handleDeleteBookmark(item._id)} className="delete-btn">
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">Chưa có tài liệu hoặc tin tức nào.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab thống kê */}
        {activeTab === "stats" && (
          <div className="stats-tab">
            <h3>Thống kê hệ thống</h3>

            <div className="stats-period-selector">
              <label htmlFor="statsPeriod">Thời gian: </label>
              <select id="statsPeriod" value={statsPeriod} onChange={handleStatsPeriodChange}>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
                <option value="year">365 ngày qua</option>
              </select>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h4>Tổng số người dùng</h4>
                <p>{stats.totalUsers || 0}</p>
              </div>
              <div className="stat-card">
                <h4>Tổng số đề thi</h4>
                <p>{stats.totalExams || 0}</p>
              </div>
              <div className="stat-card">
                <h4>Tổng số khóa học</h4>
                <p>{stats.totalCourses || 0}</p>
              </div>
              <div className="stat-card">
                <h4>Tổng số bài đăng</h4>
                <p>{stats.totalPosts || 0}</p>
              </div>
              <div className="stat-card">
                <h4>Tổng số tài liệu</h4>
                <p>{stats.totalDocuments || 0}</p>
              </div>
              <div className="stat-card">
                <h4>Tổng số tin tức</h4>
                <p>{stats.totalNews || 0}</p>
              </div>
            </div>

            {detailedStats && (
              <div className="detailed-stats">
                <h4>Thống kê chi tiết</h4>

                <div className="stats-chart">
                  <h5>Người dùng mới</h5>
                  <div className="chart-container">
                    {detailedStats.newUsers.map((item, index) => (
                      <div key={index} className="chart-bar-container">
                        <div
                          className="chart-bar"
                          style={{
                            height: `${(item.count / Math.max(...detailedStats.newUsers.map((i) => i.count))) * 100}%`,
                          }}
                        ></div>
                        <span className="chart-label">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="stats-chart">
                  <h5>Hoạt động</h5>
                  <div className="chart-container">
                    {detailedStats.activities.map((item, index) => (
                      <div key={index} className="chart-bar-container">
                        <div
                          className="chart-bar"
                          style={{
                            height: `${(item.count / Math.max(...detailedStats.activities.map((i) => i.count))) * 100}%`,
                          }}
                        ></div>
                        <span className="chart-label">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
