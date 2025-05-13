import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getUsers,
  deleteUser,
  getExams,
  approveExam,
  rejectExam,
  deleteExam,
  getStats,
  getBookmarks,
  deleteBookmark,
} from "../../services/adminService";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalCourses: 0,
    totalPosts: 0,
  });
  const [libraryItems, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersResponse = await getUsers();
        setUsers(usersResponse.data.users || []);

        const examsResponse = await getExams();
        setExams(examsResponse.data.exams || []);

        const statsResponse = await getStats();
        setStats(
          statsResponse.data || {
            totalUsers: 0,
            totalExams: 0,
            totalCourses: 0,
            totalPosts: 0,
          }
        );

        const libraryResponse = await getBookmarks();
        setBookmarks(libraryResponse.data.items || []);
      } catch (err) {
        setError("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
      toast.success("Xóa người dùng thành công!");
    } catch (err) {
      toast.error(
        "Xóa người dùng thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleApproveExam = async (examId) => {
    try {
      const response = await approveExam(examId);
      setExams(
        exams.map((exam) => (exam._id === examId ? response.data.exam : exam))
      );
      toast.success("Duyệt đề thi thành công!");
    } catch (err) {
      toast.error(
        "Duyệt đề thi thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleRejectExam = async (examId) => {
    try {
      const response = await rejectExam(examId);
      setExams(
        exams.map((exam) => (exam._id === examId ? response.data.exam : exam))
      );
      toast.success("Từ chối đề thi thành công!");
    } catch (err) {
      toast.error(
        "Từ chối đề thi thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteExam = async (examId) => {
    try {
      await deleteExam(examId);
      setExams(exams.filter((exam) => exam._id !== examId));
      toast.success("Xóa đề thi thành công!");
    } catch (err) {
      toast.error(
        "Xóa đề thi thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteBookmark = async (itemId) => {
    try {
      await deleteBookmark(itemId);
      setBookmarks(libraryItems.filter((item) => item._id !== itemId));
      toast.success("Xóa tài liệu/tin tức thành công!");
    } catch (err) {
      toast.error(
        "Xóa tài liệu/tin tức thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  if (!user || user.role !== "admin") {
    return <div>Bạn không có quyền truy cập trang này.</div>;
  }

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="admin-dashboard">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} tabs="admin" />
      <div className="dashboard-content">
        {activeTab === "users" && (
          <div className="users-tab">
            <h3>Quản lý người dùng</h3>
            <div className="user-list">
              {users.length > 0 ? (
                users.map((u) => (
                  <div key={u._id} className="user-item">
                    <div>
                      <h4>{u.username}</h4>
                      <p>Email: {u.email}</p>
                      <p>
                        Vai trò:{" "}
                        {u.role === "admin"
                          ? "Quản trị viên"
                          : u.role === "teacher"
                          ? "Giáo viên"
                          : "Học sinh"}
                      </p>
                    </div>
                    <div className="user-actions">
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={u._id === user._id}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Chưa có người dùng nào.</p>
              )}
            </div>
          </div>
        )}
        {activeTab === "exams" && (
          <div className="exams-tab">
            <h3>Quản lý đề thi</h3>
            <div className="exam-list">
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <div key={exam._id} className="exam-item">
                    <div>
                      <h4>{exam.title}</h4>
                      <p>
                        Tác giả: {exam.author?.username || "Không xác định"}
                      </p>
                      <p>
                        Cấp học:{" "}
                        {exam.educationLevel === "university"
                          ? "Đại học"
                          : `Lớp ${exam.educationLevel.replace("grade", "")}`}
                      </p>
                      <p>
                        Môn: {exam.subject === "math" ? "Toán" : exam.subject}
                      </p>
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
                          <button onClick={() => handleApproveExam(exam._id)}>
                            Duyệt
                          </button>
                          <button onClick={() => handleRejectExam(exam._id)}>
                            Từ chối
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDeleteExam(exam._id)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Chưa có đề thi nào.</p>
              )}
            </div>
          </div>
        )}
        {activeTab === "stats" && (
          <div className="stats-tab">
            <h3>Thống kê hệ thống</h3>
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
            </div>
          </div>
        )}
        {activeTab === "library" && (
          <div className="library-tab">
            <h3>Quản lý thư viện</h3>
            <div className="library-list">
              {libraryItems.length > 0 ? (
                libraryItems.map((item) => (
                  <div key={item._id} className="library-item">
                    <div>
                      <h4>{item.title}</h4>
                      <p>
                        Loại:{" "}
                        {item.type === "document" ? "Tài liệu" : "Tin tức"}
                      </p>
                    </div>
                    <div className="library-actions">
                      <button onClick={() => handleDeleteBookmark(item._id)}>
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>Chưa có tài liệu hoặc tin tức nào.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
