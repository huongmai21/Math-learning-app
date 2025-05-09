import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip as ChartTooltip, Legend } from "chart.js";
import io from 'socket.io-client';
import axios from 'axios';
import "./Profile.css";

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, ChartTooltip, Legend);

const socket = io('http://localhost:3000');

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [contributions, setContributions] = useState([]);
  const [scores, setScores] = useState([]);
  const [libraryItems, setLibraryItems] = useState([]);
  const [friendsFilter, setFriendsFilter] = useState("followers");
  const [friendsSearchQuery, setFriendsSearchQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    educationLevel: 'grade1',
    subject: 'math',
    duration: 60,
    questions: [],
    startTime: '',
    endTime: '',
    difficulty: 'easy',
  });
  const [editingExam, setEditingExam] = useState(null);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [examLeaderboards, setExamLeaderboards] = useState({});
  const [leaderboardFilters, setLeaderboardFilters] = useState({
    educationLevel: '',
    subject: '',
    timeRange: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      socket.emit('join', user._id);

      socket.on('reminder', (data) => {
        toast.info(
          <div>
            <strong>{data.title}</strong>
            <p>{data.message}</p>
            <a href={data.link}>Xem chi tiết</a>
          </div>,
          { autoClose: 10000 }
        );
      });
    }

    return () => {
      socket.off('reminder');
    };
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const mockContributions = Array(365).fill(0).map((_, index) => ({
          date: new Date(2025, 0, 1 + index).toISOString().split("T")[0],
          count: Math.floor(Math.random() * 5),
        }));
        setContributions(mockContributions);

        const mockScores = [
          { date: "2025-01", score: 85 },
          { date: "2025-02", score: 90 },
          { date: "2025-03", score: 78 },
          { date: "2025-04", score: 92 },
        ];
        setScores(mockScores);

        const mockLibraryItems = [
          { id: 1, title: "Tài liệu Toán cao cấp", type: "document" },
          { id: 2, title: "Tin tức về kỳ thi Toán", type: "news" },
        ];
        setLibraryItems(mockLibraryItems);

        const mockPosts = [
          { id: 1, title: "Câu hỏi tích phân", content: "Tìm tích phân của hàm số..." },
          { id: 2, title: "Bài đăng về Đại số", content: "Giải bài toán ma trận..." },
        ];
        setPosts(mockPosts);

        const mockCourses = [
          { id: 1, title: "Khóa học Toán cao cấp", instructor: "Giảng viên A" },
          { id: 2, title: "Khóa học Giải tích", instructor: "Giảng viên B" },
        ];
        setCourses(mockCourses);
      } catch (err) {
        setError("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  useEffect(() => {
    if (activeTab === "create-exam" && (user.role === "teacher" || user.role === "admin")) {
      const fetchMyExams = async () => {
        try {
          const response = await axios.get('http://localhost:3000/exams?author=' + user._id);
          setMyExams(response.data.exams);
        } catch (err) {
          toast.error('Lỗi khi lấy danh sách đề thi: ' + (err.message || 'Vui lòng thử lại.'));
        }
      };
      fetchMyExams();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === "leaderboard") {
      const fetchGlobalLeaderboard = async () => {
        try {
          const response = await axios.get('http://localhost:3000/exams/leaderboard/global', {
            params: leaderboardFilters,
          });
          setGlobalLeaderboard(response.data.leaderboard);
        } catch (err) {
          toast.error('Lỗi khi lấy bảng xếp hạng toàn cục: ' + (err.message || 'Vui lòng thử lại.'));
        }
      };
      fetchGlobalLeaderboard();
    }
  }, [activeTab, leaderboardFilters]);

  const fetchExamLeaderboard = async (examId) => {
    if (examLeaderboards[examId]) return;
    try {
      const response = await axios.get(`http://localhost:3000/exams/${examId}/leaderboard`);
      setExamLeaderboards((prev) => ({
        ...prev,
        [examId]: response.data.leaderboard,
      }));
    } catch (err) {
      toast.error('Lỗi khi lấy bảng xếp hạng bài thi: ' + (err.message || 'Vui lòng thử lại.'));
    }
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleEditProfile = () => {
    toast.info("Chức năng chỉnh sửa hồ sơ sẽ được triển khai sau!");
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/exams', newExam);
      setMyExams([...myExams, response.data.exam]);
      setNewExam({
        title: '',
        description: '',
        educationLevel: 'grade1',
        subject: 'math',
        duration: 60,
        questions: [],
        startTime: '',
        endTime: '',
        difficulty: 'easy',
      });
      toast.success('Tạo đề thi thành công!');
    } catch (err) {
      toast.error('Tạo đề thi thất bại: ' + (err.message || 'Vui lòng thử lại.'));
    }
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:3000/exams/${editingExam._id}`, newExam);
      setMyExams(myExams.map(exam => exam._id === editingExam._id ? response.data.exam : exam));
      setEditingExam(null);
      setNewExam({
        title: '',
        description: '',
        educationLevel: 'grade1',
        subject: 'math',
        duration: 60,
        questions: [],
        startTime: '',
        endTime: '',
        difficulty: 'easy',
      });
      toast.success('Cập nhật đề thi thành công!');
    } catch (err) {
      toast.error('Cập nhật đề thi thất bại: ' + (err.message || 'Vui lòng thử lại.'));
    }
  };

  const handleDeleteExam = async (examId) => {
    try {
      await axios.delete(`http://localhost:3000/exams/${examId}`);
      setMyExams(myExams.filter(exam => exam._id !== examId));
      toast.success('Xóa đề thi thành công!');
    } catch (err) {
      toast.error('Xóa đề thi thất bại: ' + (err.message || 'Vui lòng thử lại.'));
    }
  };

  const handleEditClick = (exam) => {
    setEditingExam(exam);
    setNewExam({
      title: exam.title,
      description: exam.description,
      educationLevel: exam.educationLevel,
      subject: exam.subject,
      duration: exam.duration,
      questions: exam.questions,
      startTime: new Date(exam.startTime).toISOString().slice(0, 16),
      endTime: new Date(exam.endTime).toISOString().slice(0, 16),
      difficulty: exam.difficulty,
    });
  };

  const months = [
    "Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6",
    "Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"
  ];

  const daysOfWeek = ["", "T2", "T4", "T6", "CN"];

  const followers = [
    { id: 1, username: "user1", avatar: "/default-avatar.png" },
    { id: 2, username: "user2", avatar: "/default-avatar.png" },
  ];
  const following = [
    { id: 3, username: "user3", avatar: "/default-avatar.png" },
    { id: 4, username: "user4", avatar: "/default-avatar.png" },
  ];

  const filteredFriends = (friendsFilter === "followers" ? followers : following).filter((friend) =>
    friend.username.toLowerCase().includes(friendsSearchQuery.toLowerCase())
  );

  const scoreChartData = {
    labels: scores.map((score) => score.date),
    datasets: [
      {
        label: "Điểm số",
        data: scores.map((score) => score.score),
        borderColor: "#0366d6",
        backgroundColor: "rgba(3, 102, 214, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const scoreChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Biểu đồ điểm số qua các tháng",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Điểm",
        },
      },
      x: {
        title: {
          display: true,
          text: "Tháng",
        },
      },
    },
  };

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!user) {
    return <div>Vui lòng đăng nhập để xem hồ sơ.</div>;
  }

  return (
    <div className="profile-page">
      <div className="sidebar-left">
        <ul>
          <li
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
            data-tooltip-id="overview-tab"
            data-tooltip-content="Tổng quan"
          >
            <i className="fa-solid fa-house"></i>
          </li>
          <li
            className={activeTab === "stats" ? "active" : ""}
            onClick={() => setActiveTab("stats")}
            data-tooltip-id="stats-tab"
            data-tooltip-content="Xem thống kê"
          >
            <i className="fa-solid fa-chart-line"></i>
          </li>
          <li
            className={activeTab === "library" ? "active" : ""}
            onClick={() => setActiveTab("library")}
            data-tooltip-id="library-tab"
            data-tooltip-content="Thư viện"
          >
            <i className="fa-solid fa-book"></i>
          </li>
          <li
            className={activeTab === "friends" ? "active" : ""}
            onClick={() => setActiveTab("friends")}
            data-tooltip-id="friends-tab"
            data-tooltip-content="Bạn bè"
          >
            <i className="fa-solid fa-users"></i>
          </li>
          <li
            className={activeTab === "posts" ? "active" : ""}
            onClick={() => setActiveTab("posts")}
            data-tooltip-id="posts-tab"
            data-tooltip-content="Bài đăng"
          >
            <i className="fa-solid fa-file-alt"></i>
          </li>
          <li
            className={activeTab === "courses" ? "active" : ""}
            onClick={() => setActiveTab("courses")}
            data-tooltip-id="courses-tab"
            data-tooltip-content="Khóa học"
          >
            <i className="fa-solid fa-graduation-cap"></i>
          </li>
          {(user.role === "teacher" || user.role === "admin") && (
            <li
              className={activeTab === "create-exam" ? "active" : ""}
              onClick={() => setActiveTab("create-exam")}
              data-tooltip-id="create-exam-tab"
              data-tooltip-content="Tạo đề thi"
            >
              <i className="fa-solid fa-pen"></i>
            </li>
          )}
          <li
            className={activeTab === "leaderboard" ? "active" : ""}
            onClick={() => setActiveTab("leaderboard")}
            data-tooltip-id="leaderboard-tab"
            data-tooltip-content="Bảng xếp hạng"
          >
            <i className="fa-solid fa-trophy"></i>
          </li>
        </ul>
        <Tooltip id="overview-tab" place="right" style={{ zIndex: 1000 }} />
        <Tooltip id="stats-tab" place="right" style={{ zIndex: 1000 }} />
        <Tooltip id="library-tab" place="right" style={{ zIndex: 1000 }} />
        <Tooltip id="friends-tab" place="right" style={{ zIndex: 1000 }} />
        <Tooltip id="posts-tab" place="right" style={{ zIndex: 1000 }} />
        <Tooltip id="courses-tab" place="right" style={{ zIndex: 1000 }} />
        <Tooltip id="create-exam-tab" place="right" style={{ zIndex: 1000 }} />
        <Tooltip id="leaderboard-tab" place="right" style={{ zIndex: 1000 }} />
      </div>
      <div className="profile-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="profile-header">
              <div className="profile-info">
                <img src={user.avatar || "/default-avatar.png"} alt="Avatar" className="profile-avatar" />
                <h2>{user.username || "Người dùng ẩn danh"}</h2>
                <div className="badges">
                  {user.badges && user.badges.map((badge, index) => (
                    <span key={index} className={`badge badge-${badge.type}`}>
                      {badge.type === 'gold' ? '🥇' : badge.type === 'silver' ? '🥈' : '🥉'}
                    </span>
                  ))}
                </div>
                <p className="follow-stats">{followers.length} người theo dõi • {following.length} đang theo dõi</p>
                <div className="profile-details">
                  <p><strong>Email:</strong> {user.email || "Chưa có email"}</p>
                  <p><strong>Vai trò:</strong> {user.role === 'admin' ? 'Quản trị viên' : user.role === 'teacher' ? 'Giáo viên' : 'Học sinh'}</p>
                  <p><strong>Tiêu sự:</strong> Không có hoạt động gần đây!</p>
                </div>
                <button className="edit-profile-btn" onClick={handleEditProfile}>Chỉnh sửa</button>
              </div>
            </div>
            <div className="heatmap-section">
              <h3>{contributions.reduce((sum, day) => sum + day.count, 0)} hoạt động trong năm {selectedYear}</h3>
              <select value={selectedYear} onChange={handleYearChange} className="year-select">
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <div className="heatmap-wrapper">
                <div className="heatmap-days">
                  {daysOfWeek.map((day, index) => (
                    <span key={index}>{day}</span>
                  ))}
                </div>
                <div>
                  <div className="heatmap-header">
                    {months.map((month, index) => (
                      <span key={index}>{month}</span>
                    ))}
                  </div>
                  <div className="heatmap">
                    {contributions.map((day, index) => (
                      <div
                        key={index}
                        className={`heatmap-day contribution-${Math.min(day.count, 4)}`}
                        data-tooltip-id={`heatmap-day-${index}`}
                        data-tooltip-content={`${day.date}: ${day.count} hoạt động`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
              {contributions.map((_, index) => (
                <Tooltip
                  key={index}
                  id={`heatmap-day-${index}`}
                  place="top"
                  style={{ zIndex: 1000 }}
                />
              ))}
            </div>
          </div>
        )}
        {activeTab === "stats" && (
          <div className="stats-tab">
            <h3>Thống kê bảng điểm</h3>
            {scores.length > 0 ? (
              <div className="score-chart">
                <Line data={scoreChartData} options={scoreChartOptions} />
              </div>
            ) : (
              <p>Chưa có dữ liệu bảng điểm.</p>
            )}
          </div>
        )}
        {activeTab === "library" && (
          <div className="library-tab">
            <h3>Thư viện</h3>
            {libraryItems.length > 0 ? (
              libraryItems.map((item) => (
                <div key={item.id} className="library-item">
                  <h4>{item.title}</h4>
                  <p>Loại: {item.type === "document" ? "Tài liệu" : "Tin tức"}</p>
                </div>
              ))
            ) : (
              <p>Chưa có tài liệu hoặc tin tức nào.</p>
            )}
          </div>
        )}
        {activeTab === "friends" && (
          <div className="friends-tab">
            <h3>Danh sách bạn bè</h3>
            <div className="friends-filter">
              <button
                className={friendsFilter === "followers" ? "active" : ""}
                onClick={() => setFriendsFilter("followers")}
              >
                Người theo dõi ({followers.length})
              </button>
              <button
                className={friendsFilter === "following" ? "active" : ""}
                onClick={() => setFriendsFilter("following")}
              >
                Đang theo dõi ({following.length})
              </button>
              <input
                type="text"
                placeholder="Tìm kiếm theo username..."
                value={friendsSearchQuery}
                onChange={(e) => setFriendsSearchQuery(e.target.value)}
              />
            </div>
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <div key={friend.id} className="friend-item">
                  <img src={friend.avatar} alt="Avatar" className="friend-avatar" />
                  <span>{friend.username}</span>
                </div>
              ))
            ) : (
              <p>Không tìm thấy bạn bè nào.</p>
            )}
          </div>
        )}
        {activeTab === "posts" && (
          <div className="posts-tab">
            <h3>Bài đăng và câu hỏi bài tập</h3>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="post-item">
                  <h4>{post.title}</h4>
                  <p>{post.content}</p>
                </div>
              ))
            ) : (
              <p>Chưa có bài đăng hoặc câu hỏi nào.</p>
            )}
          </div>
        )}
        {activeTab === "courses" && (
          <div className="courses-tab">
            <h3>Khóa học của tôi</h3>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="course-item">
                  <h4>{course.title}</h4>
                  <p>Giảng viên: {course.instructor}</p>
                </div>
              ))
            ) : (
              <p>Chưa tham gia khóa học nào.</p>
            )}
          </div>
        )}
        {activeTab === "create-exam" && (user.role === "teacher" || user.role === "admin") && (
          <div className="create-exam-tab">
            <h3>{editingExam ? 'Chỉnh sửa đề thi' : 'Tạo đề thi'}</h3>
            <form onSubmit={editingExam ? handleUpdateExam : handleCreateExam} className="edit-form">
              <label>Tiêu đề:</label>
              <input
                type="text"
                value={newExam.title}
                onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                required
              />
              <label>Mô tả:</label>
              <textarea
                value={newExam.description}
                onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
              />
              <label>Cấp học:</label>
              <select
                value={newExam.educationLevel}
                onChange={(e) => setNewExam({ ...newExam, educationLevel: e.target.value })}
              >
                {[...Array(12).keys()].map(i => (
                  <option key={i + 1} value={`grade${i + 1}`}>Lớp {i + 1}</option>
                ))}
                <option value="university">Đại học</option>
              </select>
              <label>Môn học:</label>
              <select
                value={newExam.subject}
                onChange={(e) => setNewExam({ ...newExam, subject: e.target.value })}
              >
                <option value="math">Toán</option>
                {newExam.educationLevel === 'university' && (
                  <>
                    <option value="advanced_math">Toán cao cấp</option>
                    <option value="calculus">Giải tích</option>
                    <option value="algebra">Đại số</option>
                    <option value="probability_statistics">Xác suất thống kê</option>
                    <option value="differential_equations">Phương trình vi phân</option>
                  </>
                )}
              </select>
              <label>Thời gian (phút):</label>
              <input
                type="number"
                value={newExam.duration}
                onChange={(e) => setNewExam({ ...newExam, duration: Number(e.target.value) })}
                min="1"
                required
              />
              <label>Thời gian bắt đầu:</label>
              <input
                type="datetime-local"
                value={newExam.startTime}
                onChange={(e) => setNewExam({ ...newExam, startTime: e.target.value })}
                required
              />
              <label>Thời gian kết thúc:</label>
              <input
                type="datetime-local"
                value={newExam.endTime}
                onChange={(e) => setNewExam({ ...newExam, endTime: e.target.value })}
                required
              />
              <label>Độ khó:</label>
              <select
                value={newExam.difficulty}
                onChange={(e) => setNewExam({ ...newExam, difficulty: e.target.value })}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
              <div className="edit-actions">
                <button type="submit" className="save-btn">{editingExam ? 'Cập nhật' : 'Tạo'}</button>
                {editingExam && (
                  <button type="button" className="cancel-btn" onClick={() => {
                    setEditingExam(null);
                    setNewExam({
                      title: '',
                      description: '',
                      educationLevel: 'grade1',
                      subject: 'math',
                      duration: 60,
                      questions: [],
                      startTime: '',
                      endTime: '',
                      difficulty: 'easy',
                    });
                  }}>
                    Hủy
                  </button>
                )}
              </div>
            </form>

            <h3 style={{ marginTop: '20px' }}>Danh sách đề thi đã tạo</h3>
            {myExams.length > 0 ? (
              <div className="exam-list">
                {myExams.map((exam) => (
                  <div key={exam._id} className="exam-item">
                    <div>
                      <h4>{exam.title}</h4>
                      <p>Cấp học: {exam.educationLevel === 'university' ? 'Đại học' : `Lớp ${exam.educationLevel.replace('grade', '')}`}</p>
                      <p>Môn: {
                        exam.subject === 'math' ? 'Toán' :
                        exam.subject === 'advanced_math' ? 'Toán cao cấp' :
                        exam.subject === 'calculus' ? 'Giải tích' :
                        exam.subject === 'algebra' ? 'Đại số' :
                        exam.subject === 'probability_statistics' ? 'Xác suất thống kê' :
                        'Phương trình vi phân'
                      }</p>
                    </div>
                    <div className="exam-actions">
                      <button onClick={() => handleEditClick(exam)}>Chỉnh sửa</button>
                      <button onClick={() => handleDeleteExam(exam._id)}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có đề thi nào.</p>
            )}
          </div>
        )}
        {activeTab === "leaderboard" && (
          <div className="leaderboard-tab">
            <h3>Bảng xếp hạng toàn cục</h3>
            <div className="leaderboard-filters">
              <select
                name="educationLevel"
                value={leaderboardFilters.educationLevel}
                onChange={(e) => setLeaderboardFilters({ ...leaderboardFilters, educationLevel: e.target.value })}
              >
                <option value="">Tất cả cấp học</option>
                {[...Array(12).keys()].map(i => (
                  <option key={i + 1} value={`grade${i + 1}`}>Lớp {i + 1}</option>
                ))}
                <option value="university">Đại học</option>
              </select>
              <select
                name="subject"
                value={leaderboardFilters.subject}
                onChange={(e) => setLeaderboardFilters({ ...leaderboardFilters, subject: e.target.value })}
              >
                <option value="">Tất cả môn</option>
                <option value="math">Toán</option>
                <option value="advanced_math">Toán cao cấp</option>
                <option value="calculus">Giải tích</option>
                <option value="algebra">Đại số</option>
                <option value="probability_statistics">Xác suất thống kê</option>
                <option value="differential_equations">Phương trình vi phân</option>
              </select>
              <select
                name="timeRange"
                value={leaderboardFilters.timeRange}
                onChange={(e) => setLeaderboardFilters({ ...leaderboardFilters, timeRange: e.target.value })}
              >
                <option value="">Tất cả thời gian</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
              </select>
            </div>
            {globalLeaderboard.length > 0 ? (
              <div className="leaderboard-list">
                {globalLeaderboard.map((entry, index) => (
                  <div key={entry._id} className="leaderboard-item">
                    <span className="rank">{index + 1}</span>
                    <span className="username">{entry.username}</span>
                    <span className="score">Tổng điểm: {entry.totalScore}</span>
                    <span className="exams">Số bài thi: {entry.totalExams}</span>
                    {entry.badge && (
                      <span className={`badge badge-${entry.badge}`}>
                        {entry.badge === 'gold' ? '🥇' : entry.badge === 'silver' ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có dữ liệu bảng xếp hạng.</p>
            )}

            <h3 style={{ marginTop: '20px' }}>Bảng xếp hạng theo bài thi</h3>
            {myExams.length > 0 ? (
              myExams.map((exam) => (
                <div key={exam._id} className="exam-leaderboard">
                  <h4 onClick={() => fetchExamLeaderboard(exam._id)} style={{ cursor: 'pointer' }}>
                    {exam.title} (Nhấn để xem)
                  </h4>
                  {examLeaderboards[exam._id] && (
                    <div className="leaderboard-list">
                      {examLeaderboards[exam._id].length > 0 ? (
                        examLeaderboards[exam._id].map((entry, index) => (
                          <div key={entry._id} className="leaderboard-item">
                            <span className="rank">{index + 1}</span>
                            <span className="username">{entry.user.username}</span>
                            <span className="score">Điểm: {entry.totalScore}</span>
                            <span className="time">Thời gian: {new Date(entry.endTime).toLocaleString()}</span>
                          </div>
                        ))
                      ) : (
                        <p>Chưa có người tham gia bài thi này.</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>Chưa có bài thi nào để hiển thị bảng xếp hạng.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;