"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
} from "chart.js";
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
} from "../../services/adminService";
import "./AdminDashboard.css";

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [news, setNews] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [libraryItems, setBookmarks] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalCourses: 0,
    totalPosts: 0,
    totalDocuments: 0,
    totalNews: 0,
  });
  const [detailedStats, setDetailedStats] = useState(null);
  const [statsPeriod, setStatsPeriod] = useState("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Hàm fetch dữ liệu
  const fetchData = useCallback(async () => {
    if (!user || user.role !== "admin") {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Tải dữ liệu dựa trên tab đang active
      switch (activeTab) {
        case "dashboard":
          try {
            const statsResponse = await getStats();
            setStats(
              statsResponse.data || {
                totalUsers: 0,
                totalExams: 0,
                totalCourses: 0,
                totalPosts: 0,
                totalDocuments: 0,
                totalNews: 0,
              }
            );
          } catch (error) {
            console.error("Error fetching stats:", error);
            // Sử dụng dữ liệu mẫu nếu API không hoạt động
            setStats({
              totalUsers: 120,
              totalExams: 45,
              totalCourses: 30,
              totalPosts: 250,
              totalDocuments: 85,
              totalNews: 42,
            });
          }

          try {
            const detailedStatsResponse = await getDetailedStats(statsPeriod);
            setDetailedStats(
              detailedStatsResponse.data || generateMockDetailedStats()
            );
          } catch (error) {
            console.error("Error fetching detailed stats:", error);
            setDetailedStats(generateMockDetailedStats());
          }
          break;
        case "users":
          try {
            const usersResponse = await getUsers();
            setUsers(usersResponse.data.users || []);
          } catch (error) {
            console.error("Error fetching users:", error);
            // Sử dụng dữ liệu mẫu nếu API không hoạt động
            setUsers(generateMockUsers());
          }
          break;
        case "courses":
          try {
            const coursesResponse = await getCourses();
            setCourses(coursesResponse.data.courses || []);
          } catch (error) {
            console.error("Error fetching courses:", error);
            // Sử dụng dữ liệu mẫu nếu API không hoạt động
            setCourses(generateMockCourses());
          }
          break;
        case "exams":
          try {
            const examsResponse = await getExams();
            setExams(examsResponse.data.exams || []);
          } catch (error) {
            console.error("Error fetching exams:", error);
            // Sử dụng dữ liệu mẫu nếu API không hoạt động
            setExams(generateMockExams());
          }
          break;
        case "news":
          try {
            const newsResponse = await getNews();
            setNews(newsResponse.data.news || []);
          } catch (error) {
            console.error("Error fetching news:", error);
            // Sử dụng dữ liệu mẫu nếu API không hoạt động
            setNews(generateMockNews());
          }
          break;
        case "documents":
          try {
            const documentsResponse = await getDocuments();
            setDocuments(documentsResponse.data.documents || []);
          } catch (error) {
            console.error("Error fetching documents:", error);
            // Sử dụng dữ liệu mẫu nếu API không hoạt động
            setDocuments(generateMockDocuments());
          }
          break;
        case "library":
          try {
            const libraryResponse = await getBookmarks();
            setBookmarks(libraryResponse.data.items || []);
          } catch (error) {
            console.error("Error fetching library items:", error);
            // Sử dụng dữ liệu mẫu nếu API không hoạt động
            setBookmarks(generateMockLibraryItems());
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Không thể tải dữ liệu! Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [activeTab, statsPeriod, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hàm tạo dữ liệu mẫu cho thống kê chi tiết
  const generateMockDetailedStats = () => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString("vi-VN");
    });

    return {
      newUsers: dates.map((date) => ({
        date,
        count: Math.floor(Math.random() * 10) + 1,
      })),
      activities: dates.map((date) => ({
        date,
        count: Math.floor(Math.random() * 50) + 10,
      })),
    };
  };

  // Hàm tạo dữ liệu mẫu cho người dùng
  const generateMockUsers = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      _id: `user_${i + 1}`,
      username: `user_${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 5 === 0 ? "admin" : i % 3 === 0 ? "teacher" : "student",
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toISOString(),
    }));
  };

  // Hàm tạo dữ liệu mẫu cho khóa học
  const generateMockCourses = () => {
    const statuses = ["pending", "approved", "rejected"];
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `course_${i + 1}`,
      title: `Khóa học mẫu ${i + 1}`,
      description: `Mô tả khóa học mẫu ${i + 1}`,
      price: Math.floor(Math.random() * 1000000),
      author: { username: `teacher_${(i % 5) + 1}` },
      status: statuses[i % 3],
    }));
  };

  // Hàm tạo dữ liệu mẫu cho đề thi
  const generateMockExams = () => {
    const statuses = ["pending", "approved", "rejected"];
    const educationLevels = [
      "grade1",
      "grade2",
      "grade3",
      "grade4",
      "grade5",
      "grade6",
      "grade7",
      "grade8",
      "grade9",
      "grade10",
      "grade11",
      "grade12",
      "university",
    ];
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `exam_${i + 1}`,
      title: `Đề thi mẫu ${i + 1}`,
      description: `Mô tả đề thi mẫu ${i + 1}`,
      author: { username: `teacher_${(i % 5) + 1}` },
      educationLevel: educationLevels[i % educationLevels.length],
      subject: "math",
      status: statuses[i % 3],
    }));
  };

  // Hàm tạo dữ liệu mẫu cho tin tức
  const generateMockNews = () => {
    const statuses = ["pending", "approved", "rejected"];
    const categories = ["Giáo dục", "Thi cử", "Đại học", "Học bổng", "Sự kiện"];
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `news_${i + 1}`,
      title: `Tin tức mẫu ${i + 1}`,
      description: `Mô tả tin tức mẫu ${i + 1}`,
      author: { username: `author_${(i % 5) + 1}` },
      category: categories[i % categories.length],
      status: statuses[i % 3],
    }));
  };

  // Hàm tạo dữ liệu mẫu cho tài liệu
  const generateMockDocuments = () => {
    const statuses = ["pending", "approved", "rejected"];
    const educationLevels = ["primary", "secondary", "high", "university"];
    const documentTypes = [
      "Sách giáo khoa",
      "Sách bài tập",
      "Tài liệu tham khảo",
      "Đề thi mẫu",
      "Bài giảng",
    ];
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `document_${i + 1}`,
      title: `Tài liệu mẫu ${i + 1}`,
      description: `Mô tả tài liệu mẫu ${i + 1}`,
      uploadedBy: { username: `uploader_${(i % 5) + 1}` },
      educationLevel: educationLevels[i % educationLevels.length],
      documentType: documentTypes[i % documentTypes.length],
      status: statuses[i % 3],
    }));
  };

  // Hàm tạo dữ liệu mẫu cho thư viện
  const generateMockLibraryItems = () => {
    const types = ["document", "news"];
    return Array.from({ length: 15 }, (_, i) => ({
      _id: `library_${i + 1}`,
      title: `Mục thư viện mẫu ${i + 1}`,
      type: types[i % 2],
      user: { username: `user_${(i % 5) + 1}` },
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000)
      ).toISOString(),
    }));
  };

  // Xử lý người dùng
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

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

  const handleUpdateUserRole = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      setUsers(users.map((u) => (u._id === userId ? { ...u, role } : u)));
      toast.success("Cập nhật vai trò người dùng thành công!");
    } catch (err) {
      toast.error(
        "Cập nhật vai trò thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  // Xử lý khóa học
  const handleApproveCourse = async (courseId) => {
    try {
      const response = await approveCourse(courseId);
      setCourses(
        courses.map((course) =>
          course._id === courseId ? response.data.course : course
        )
      );
      toast.success("Duyệt khóa học thành công!");
    } catch (err) {
      toast.error(
        "Duyệt khóa học thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleRejectCourse = async (courseId) => {
    try {
      const response = await rejectCourse(courseId);
      setCourses(
        courses.map((course) =>
          course._id === courseId ? response.data.course : course
        )
      );
      toast.success("Từ chối khóa học thành công!");
    } catch (err) {
      toast.error(
        "Từ chối khóa học thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) return;

    try {
      await deleteCourse(courseId);
      setCourses(courses.filter((course) => course._id !== courseId));
      toast.success("Xóa khóa học thành công!");
    } catch (err) {
      toast.error(
        "Xóa khóa học thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  // Xử lý đề thi
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
    if (!window.confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return;

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

  // Xử lý tin tức
  const handleApproveNews = async (newsId) => {
    try {
      const response = await approveNews(newsId);
      setNews(
        news.map((item) => (item._id === newsId ? response.data.news : item))
      );
      toast.success("Duyệt tin tức thành công!");
    } catch (err) {
      toast.error(
        "Duyệt tin tức thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleRejectNews = async (newsId) => {
    try {
      const response = await rejectNews(newsId);
      setNews(
        news.map((item) => (item._id === newsId ? response.data.news : item))
      );
      toast.success("Từ chối tin tức thành công!");
    } catch (err) {
      toast.error(
        "Từ chối tin tức thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tin tức này?")) return;

    try {
      await deleteNews(newsId);
      setNews(news.filter((item) => item._id !== newsId));
      toast.success("Xóa tin tức thành công!");
    } catch (err) {
      toast.error(
        "Xóa tin tức thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  // Xử lý tài liệu
  const handleApproveDocument = async (documentId) => {
    try {
      const response = await approveDocument(documentId);
      setDocuments(
        documents.map((doc) =>
          doc._id === documentId ? response.data.document : doc
        )
      );
      toast.success("Duyệt tài liệu thành công!");
    } catch (err) {
      toast.error(
        "Duyệt tài liệu thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleRejectDocument = async (documentId) => {
    try {
      const response = await rejectDocument(documentId);
      setDocuments(
        documents.map((doc) =>
          doc._id === documentId ? response.data.document : doc
        )
      );
      toast.success("Từ chối tài liệu thành công!");
    } catch (err) {
      toast.error(
        "Từ chối tài liệu thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

    try {
      await deleteDocument(documentId);
      setDocuments(documents.filter((doc) => doc._id !== documentId));
      toast.success("Xóa tài liệu thành công!");
    } catch (err) {
      toast.error(
        "Xóa tài liệu thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  // Xử lý thư viện
  const handleDeleteBookmark = async (itemId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này khỏi thư viện?"))
      return;

    try {
      await deleteBookmark(itemId);
      setBookmarks(libraryItems.filter((item) => item._id !== itemId));
      toast.success("Xóa mục thư viện thành công!");
    } catch (err) {
      toast.error(
        "Xóa mục thư viện thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  // Xử lý thống kê
  const handleStatsPeriodChange = (e) => {
    setStatsPeriod(e.target.value);
  };

  // Xử lý tìm kiếm và lọc
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  // Xử lý phân trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Lọc dữ liệu theo tìm kiếm và trạng thái
  const getFilteredData = (data, type) => {
    let filteredData = [...data];

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();

      switch (type) {
        case "users":
          filteredData = filteredData.filter(
            (item) =>
              item.username?.toLowerCase().includes(searchLower) ||
              item.email?.toLowerCase().includes(searchLower)
          );
          break;
        case "courses":
        case "exams":
        case "news":
        case "documents":
          filteredData = filteredData.filter(
            (item) =>
              item.title?.toLowerCase().includes(searchLower) ||
              item.description?.toLowerCase().includes(searchLower)
          );
          break;
        case "library":
          filteredData = filteredData.filter((item) =>
            item.title?.toLowerCase().includes(searchLower)
          );
          break;
        default:
          break;
      }
    }

    // Lọc theo trạng thái
    if (
      filterStatus !== "all" &&
      ["courses", "exams", "news", "documents"].includes(type)
    ) {
      filteredData = filteredData.filter(
        (item) => item.status === filterStatus
      );
    }

    return filteredData;
  };

  // Phân trang dữ liệu
  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Tạo dữ liệu biểu đồ
  const createChartData = () => {
    if (!detailedStats) return null;

    // Dữ liệu biểu đồ người dùng mới
    const newUsersData = {
      labels: detailedStats.newUsers.map((item) => item.date),
      datasets: [
        {
          label: "Người dùng mới",
          data: detailedStats.newUsers.map((item) => item.count),
          borderColor: "rgba(255, 111, 97, 1)",
          backgroundColor: "rgba(255, 111, 97, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
    };

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
    };

    // Dữ liệu biểu đồ tròn phân phối nội dung
    const contentDistributionData = {
      labels: ["Khóa học", "Đề thi", "Tài liệu", "Tin tức", "Bài đăng"],
      datasets: [
        {
          data: [
            stats.totalCourses,
            stats.totalExams,
            stats.totalDocuments,
            stats.totalNews,
            stats.totalPosts,
          ],
          backgroundColor: [
            "rgba(255, 111, 97, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
          ],
          borderWidth: 1,
        },
      ],
    };

    return {
      newUsersData,
      activitiesData,
      contentDistributionData,
    };
  };

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
  };

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
    );
  }

  // Hiển thị trạng thái loading
  if (loading && isInitialLoad) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error && isInitialLoad) {
    return (
      <div className="admin-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h2>Đã xảy ra lỗi</h2>
        <p>{error}</p>
        <button onClick={fetchData} className="retry-btn">
          Thử lại
        </button>
      </div>
    );
  }

  // Tạo dữ liệu biểu đồ
  const chartData = createChartData();

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <i className="fas fa-cogs"></i>
          <h2>Quản trị hệ thống</h2>
        </div>
        <ul className="admin-menu">
          <li
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Tổng quan</span>
          </li>
          <li
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            <i className="fas fa-users"></i>
            <span>Quản lý người dùng</span>
          </li>
          <li
            className={activeTab === "courses" ? "active" : ""}
            onClick={() => setActiveTab("courses")}
          >
            <i className="fas fa-graduation-cap"></i>
            <span>Quản lý khóa học</span>
          </li>
          <li
            className={activeTab === "exams" ? "active" : ""}
            onClick={() => setActiveTab("exams")}
          >
            <i className="fas fa-file-alt"></i>
            <span>Quản lý đề thi</span>
          </li>
          <li
            className={activeTab === "news" ? "active" : ""}
            onClick={() => setActiveTab("news")}
          >
            <i className="fas fa-newspaper"></i>
            <span>Quản lý tin tức</span>
          </li>
          <li
            className={activeTab === "documents" ? "active" : ""}
            onClick={() => setActiveTab("documents")}
          >
            <i className="fas fa-book"></i>
            <span>Quản lý tài liệu</span>
          </li>
          <li
            className={activeTab === "library" ? "active" : ""}
            onClick={() => setActiveTab("library")}
          >
            <i className="fas fa-bookmark"></i>
            <span>Quản lý thư viện</span>
          </li>
        </ul>
        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <img
              src={
                user.avatar ||
                "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png"
              }
              alt="Admin avatar"
              className="admin-avatar"
              onError={(e) => {
                e.target.src =
                  "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png";
              }}
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
                <select
                  value={statsPeriod}
                  onChange={handleStatsPeriodChange}
                  className="period-selector"
                >
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
                    <Line
                      data={chartData.newUsersData}
                      options={chartOptions}
                    />
                  </div>
                </div>
                <div className="chart-wrapper">
                  <h3>Hoạt động</h3>
                  <div className="chart">
                    <Bar
                      data={chartData.activitiesData}
                      options={chartOptions}
                    />
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

            {loading ? (
              <div className="loading-indicator">
                <div className="spinner-sm"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
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
                      {getPaginatedData(getFilteredData(users, "users")).map(
                        (u) => (
                          <tr key={u._id}>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>
                              <select
                                value={u.role}
                                onChange={(e) =>
                                  handleUpdateUserRole(u._id, e.target.value)
                                }
                                disabled={u._id === user._id}
                                className="role-select"
                              >
                                <option value="student">Học sinh</option>
                                <option value="teacher">Giáo viên</option>
                                <option value="admin">Quản trị viên</option>
                              </select>
                            </td>
                            <td>
                              {new Date(u.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
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
                        )
                      )}
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
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
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
                      Trang {currentPage} /{" "}
                      {Math.ceil(
                        getFilteredData(users, "users").length / itemsPerPage
                      )}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(users, "users").length / itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(
                            getFilteredData(users, "users").length /
                              itemsPerPage
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(users, "users").length / itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                )}
              </>
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
                  <select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
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

            {loading ? (
              <div className="loading-indicator">
                <div className="spinner-sm"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
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
                      {getPaginatedData(
                        getFilteredData(courses, "courses")
                      ).map((course) => (
                        <tr key={course._id}>
                          <td>{course.title}</td>
                          <td>{course.author?.username || "Không xác định"}</td>
                          <td>
                            {course.price
                              ? `${course.price.toLocaleString("vi-VN")} VND`
                              : "Miễn phí"}
                          </td>
                          <td>
                            <span
                              className={`status-badge status-${course.status}`}
                            >
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
                                    onClick={() =>
                                      handleApproveCourse(course._id)
                                    }
                                    className="approve-btn"
                                    title="Duyệt khóa học"
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectCourse(course._id)
                                    }
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
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
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
                      Trang {currentPage} /{" "}
                      {Math.ceil(
                        getFilteredData(courses, "courses").length /
                          itemsPerPage
                      )}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(courses, "courses").length /
                            itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(
                            getFilteredData(courses, "courses").length /
                              itemsPerPage
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(courses, "courses").length /
                            itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                )}
              </>
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
                  <select
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
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

            {loading ? (
              <div className="loading-indicator">
                <div className="spinner-sm"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
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
                      {getPaginatedData(getFilteredData(exams, "exams")).map(
                        (exam) => (
                          <tr key={exam._id}>
                            <td>{exam.title}</td>
                            <td>{exam.author?.username || "Không xác định"}</td>
                            <td>
                              {exam.educationLevel === "university"
                                ? "Đại học"
                                : `Lớp ${exam.educationLevel.replace(
                                    "grade",
                                    ""
                                  )}`}
                            </td>
                            <td>
                              {exam.subject === "math" ? "Toán" : exam.subject}
                            </td>
                            <td>
                              <span
                                className={`status-badge status-${exam.status}`}
                              >
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
                                      onClick={() =>
                                        handleApproveExam(exam._id)
                                      }
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
                                <button
                                  onClick={() => handleDeleteExam(exam._id)}
                                  className="delete-btn"
                                  title="Xóa đề thi"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
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
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
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
                      Trang {currentPage} /{" "}
                      {Math.ceil(
                        getFilteredData(exams, "exams").length / itemsPerPage
                      )}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(exams, "exams").length / itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-right"></i>
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(
                          Math.ceil(
                            getFilteredData(exams, "exams").length /
                              itemsPerPage
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(
                          getFilteredData(exams, "exams").length / itemsPerPage
                        )
                      }
                      className="pagination-btn"
                    >
                      <i className="fas fa-angle-double-right"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Các tab khác tương tự */}
        {/* Quản lý tin tức, tài liệu, thư viện... */}
      </div>
    </div>
  );
};

export default AdminDashboard;
