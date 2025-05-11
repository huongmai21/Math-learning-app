import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import io from "socket.io-client";
import api from "../../services/api";
import Sidebar from "../../components/layout/Sidebar";
import { format } from "date-fns";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  ChartTooltip,
  Legend
);

const socket = io("http://localhost:5000");

const Profile = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [contributions, setContributions] = useState([]);
  const [scores, setScores] = useState([]);
  const [libraryItems, setLibraryItems] = useState([]);
  const [friendsFilter, setFriendsFilter] = useState("followers");
  const [friendsSearchQuery, setFriendsSearchQuery] = useState("");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [posts, setPosts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [newExam, setNewExam] = useState({
    title: "",
    description: "",
    educationLevel: "grade1",
    subject: "math",
    duration: 60,
    questions: [],
    startTime: "",
    endTime: "",
    difficulty: "easy",
  });
  const [editingExam, setEditingExam] = useState(null);
  const [profileData, setProfileData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    avatar: null,
  });
  const [newLibraryItem, setNewLibraryItem] = useState({
    title: "",
    type: "document",
    url: "",
  });
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    type: "post",
  });
  const [newCourse, setNewCourse] = useState({ title: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      socket.emit("join", user._id);
      socket.on("reminder", (data) => {
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
      socket.off("reminder");
    };
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch profile
        const profileRes = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData({
          username: profileRes.data.username,
          email: profileRes.data.email,
          avatar: null,
        });

        // Fetch activity
        const activityRes = await api.get(
          `/users/activity?year=${selectedYear}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setContributions(activityRes.data.activity);

        // Fetch scores
        const scoresRes = await api.get("/profile/scores", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setScores(
          scoresRes.data.data.map((score) => ({
            date: format(new Date(score.date), "yyyy-MM"),
            score: score.score,
            examTitle: score.examId?.title || score.courseId?.title,
          }))
        );

        // Fetch library items
        const libraryRes = await api.get("/profile/library", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLibraryItems(libraryRes.data.data);

        // Fetch followers and following
        const followersRes = await api.get("/users/followers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowers(followersRes.data);
        const followingRes = await api.get("/users/following", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFollowing(followingRes.data);

        // Fetch posts
        const postsRes = await api.get("/profile/posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(postsRes.data.data);

        // Fetch courses
        const coursesRes = await api.get("/profile/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(coursesRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [selectedYear, token]);

  useEffect(() => {
    if (
      activeTab === "create-exam" &&
      (user?.role === "teacher" || user?.role === "admin")
    ) {
      const fetchMyExams = async () => {
        try {
          const response = await api.get(`/exams?author=${user._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMyExams(response.data.exams);
        } catch (err) {
          toast.error(
            "Lỗi khi lấy danh sách đề thi: " +
              (err.response?.data?.message || "Vui lòng thử lại.")
          );
        }
      };
      fetchMyExams();
    }
  }, [activeTab, user, token]);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("username", profileData.username);
    data.append("email", profileData.email);
    if (profileData.avatar) {
      data.append("avatar", profileData.avatar);
    }

    try {
      const response = await api.put("/users", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Cập nhật hồ sơ thành công!");
      setProfileData({
        username: response.data.data.username,
        email: response.data.data.email,
        avatar: null,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật hồ sơ thất bại!");
    }
  };

  const handleAddLibraryItem = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/profile/library", newLibraryItem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLibraryItems([...libraryItems, response.data.data]);
      setNewLibraryItem({ title: "", type: "document", url: "" });
      toast.success("Thêm tài liệu/tin tức thành công!");
    } catch (err) {
      toast.error(
        "Thêm tài liệu/tin tức thất bại: " +
          (err.response?.data?.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/profile/posts", newPost, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts([...posts, response.data.data]);
      setNewPost({ title: "", content: "", type: "post" });
      toast.success("Tạo bài đăng/câu hỏi thành công!");
    } catch (err) {
      toast.error(
        "Tạo bài đăng/câu hỏi thất bại: " +
          (err.response?.data?.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/profile/courses", newCourse, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses([...courses, response.data.data]);
      setNewCourse({ title: "" });
      toast.success("Tạo khóa học thành công!");
    } catch (err) {
      toast.error(
        "Tạo khóa học thất bại: " +
          (err.response?.data?.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/exams", newExam, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyExams([...myExams, response.data.exam]);
      setNewExam({
        title: "",
        description: "",
        educationLevel: "grade1",
        subject: "math",
        duration: 60,
        questions: [],
        startTime: "",
        endTime: "",
        difficulty: "easy",
      });
      toast.success("Tạo đề thi thành công!");
    } catch (err) {
      toast.error(
        "Tạo đề thi thất bại: " +
          (err.response?.data?.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/exams/${editingExam._id}`, newExam, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyExams(
        myExams.map((exam) =>
          exam._id === editingExam._id ? response.data.exam : exam
        )
      );
      setEditingExam(null);
      setNewExam({
        title: "",
        description: "",
        educationLevel: "grade1",
        subject: "math",
        duration: 60,
        questions: [],
        startTime: "",
        endTime: "",
        difficulty: "easy",
      });
      toast.success("Cập nhật đề thi thành công!");
    } catch (err) {
      toast.error(
        "Cập nhật đề thi thất bại: " +
          (err.response?.data?.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteExam = async (examId) => {
    try {
      await api.delete(`/exams/${examId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyExams(myExams.filter((exam) => exam._id !== examId));
      toast.success("Xóa đề thi thành công!");
    } catch (err) {
      toast.error(
        "Xóa đề thi thất bại: " +
          (err.response?.data?.message || "Vui lòng thử lại.")
      );
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
      startTime: format(new Date(exam.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(exam.endTime), "yyyy-MM-dd'T'HH:mm"),
      difficulty: exam.difficulty,
    });
  };

  const scoreChartData = {
    labels: scores.map((score) => score.date),
    datasets: [
      {
        label: "Điểm số",
        data: scores.map((score) => score.score),
        borderColor: "#e74c3c",
        backgroundColor: "rgba(231, 76, 60, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const scoreChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Biểu đồ điểm số qua các tháng" },
      tooltip: {
        callbacks: {
          label: (context) => {
            const score = scores[context.dataIndex];
            return `${score.score} điểm (${score.examTitle || "Khóa học"})`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: "Điểm" },
      },
      x: { title: { display: true, text: "Tháng" } },
    },
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-10">Vui lòng đăng nhập để xem hồ sơ.</div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-70px)] bg-[#f5f5f5] p-5">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        tabs="profile"
      />
      <div className="flex-1 ml-20">
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-lg shadow">
              <div className="max-w-md mx-auto text-center">
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-[#34495e]">
                  {user.username}
                </h2>
                <div className="flex justify-center gap-2 mb-4">
                  {user.badges?.map((badge, index) => (
                    <span key={index} className="text-2xl">
                      {badge.type === "gold"
                        ? "🥇"
                        : badge.type === "silver"
                        ? "🥈"
                        : "🥉"}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {followers.length} người theo dõi • {following.length} đang
                  theo dõi
                </p>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                      placeholder="Tên người dùng"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleProfileChange}
                      className="w-full p-2 border rounded-full"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#e74c3c] text-white py-2 rounded-full hover:bg-[#c0392b]"
                  >
                    Cập nhật hồ sơ
                  </button>
                </form>
              </div>
            </div>
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="text-lg font-bold text-[#34495e] mb-4">
                {contributions.reduce((sum, day) => sum + day.count, 0)} hoạt
                động trong năm {selectedYear}
              </h3>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="absolute top-5 right-5 border rounded p-1"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
              <div className="flex">
                <div className="flex flex-col justify-between h-28 mr-2 text-sm text-gray-500">
                  {["", "T2", "T4", "T6", "CN"].map((day, index) => (
                    <span key={index}>{day}</span>
                  ))}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2 text-sm text-gray-500">
                    {[
                      "Thg 1",
                      "Thg 2",
                      "Thg 3",
                      "Thg 4",
                      "Thg 5",
                      "Thg 6",
                      "Thg 7",
                      "Thg 8",
                      "Thg 9",
                      "Thg 10",
                      "Thg 11",
                      "Thg 12",
                    ].map((month, index) => (
                      <span key={index} className="w-[8.33%] text-center">
                        {month}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-[repeat(53,1fr)] grid-rows-7 gap-1">
                    {contributions.map((day, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-sm ${
                          day.count === 0
                            ? "bg-gray-200"
                            : day.count === 1
                            ? "bg-green-200"
                            : day.count === 2
                            ? "bg-green-400"
                            : day.count === 3
                            ? "bg-green-600"
                            : "bg-green-800"
                        } hover:scale-125 transition-transform`}
                        title={`${day.date}: ${day.count} hoạt động`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "stats" && user.role === "student" && (
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-bold text-[#34495e] mb-4">
              Thống kê bảng điểm
            </h3>
            {scores.length > 0 ? (
              <div className="max-w-2xl mx-auto">
                <Line data={scoreChartData} options={scoreChartOptions} />
              </div>
            ) : (
              <p className="text-gray-500">Chưa có dữ liệu bảng điểm.</p>
            )}
          </div>
        )}
        {activeTab === "library" && (
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-bold text-[#34495e] mb-4">Thư viện</h3>
            <form onSubmit={handleAddLibraryItem} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-[#34495e]">Tiêu đề</label>
                <input
                  type="text"
                  value={newLibraryItem.title}
                  onChange={(e) =>
                    setNewLibraryItem({
                      ...newLibraryItem,
                      title: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#34495e]">Loại</label>
                <select
                  value={newLibraryItem.type}
                  onChange={(e) =>
                    setNewLibraryItem({
                      ...newLibraryItem,
                      type: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                >
                  <option value="document">Tài liệu</option>
                  <option value="news">Tin tức</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#34495e]">URL</label>
                <input
                  type="url"
                  value={newLibraryItem.url}
                  onChange={(e) =>
                    setNewLibraryItem({
                      ...newLibraryItem,
                      url: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#e74c3c] text-white py-2 rounded-full hover:bg-[#c0392b]"
              >
                Thêm vào thư viện
              </button>
            </form>
            {libraryItems.length > 0 ? (
              libraryItems.map((item) => (
                <div
                  key={item._id}
                  className="p-4 mb-2 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="text-base font-semibold text-[#34495e]">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {item.title}
                    </a>
                  </h4>
                  <p className="text-sm text-gray-500">
                    Loại: {item.type === "document" ? "Tài liệu" : "Tin tức"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                Chưa có tài liệu hoặc tin tức nào.
              </p>
            )}
          </div>
        )}
        {activeTab === "friends" && (
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-bold text-[#34495e] mb-4">
              Danh sách bạn bè
            </h3>
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded ${
                  friendsFilter === "followers"
                    ? "bg-[#e74c3c] text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setFriendsFilter("followers")}
              >
                Người theo dõi ({followers.length})
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  friendsFilter === "following"
                    ? "bg-[#e74c3c] text-white"
                    : "bg-gray-200"
                }`}
                onClick={() => setFriendsFilter("following")}
              >
                Đang theo dõi ({following.length})
              </button>
              <input
                type="text"
                placeholder="Tìm kiếm theo username..."
                value={friendsSearchQuery}
                onChange={(e) => setFriendsSearchQuery(e.target.value)}
                className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
              />
            </div>
            {(friendsFilter === "followers" ? followers : following).filter(
              (friend) =>
                friend.username
                  .toLowerCase()
                  .includes(friendsSearchQuery.toLowerCase())
            ).length > 0 ? (
              (friendsFilter === "followers" ? followers : following)
                .filter((friend) =>
                  friend.username
                    .toLowerCase()
                    .includes(friendsSearchQuery.toLowerCase())
                )
                .map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center gap-2 p-4 mb-2 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <img
                      src={friend.avatar}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="text-[#34495e]">{friend.username}</span>
                  </div>
                ))
            ) : (
              <p className="text-gray-500">Không tìm thấy bạn bè nào.</p>
            )}
          </div>
        )}
        {activeTab === "posts" && (
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-bold text-[#34495e] mb-4">
              Bài đăng và câu hỏi bài tập
            </h3>
            <form onSubmit={handleCreatePost} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-[#34495e]">Tiêu đề</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#34495e]">Nội dung</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#34495e]">Loại</label>
                <select
                  value={newPost.type}
                  onChange={(e) =>
                    setNewPost({ ...newPost, type: e.target.value })
                  }
                  className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                >
                  <option value="post">Bài đăng</option>
                  <option value="question">Câu hỏi</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-[#e74c3c] text-white py-2 rounded-full hover:bg-[#c0392b]"
              >
                Đăng bài
              </button>
            </form>
            {posts.length > 0 ? (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="p-4 mb-2 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="text-base font-semibold text-[#34495e]">
                    {post.title}
                  </h4>
                  <p className="text-sm text-gray-500">{post.content}</p>
                  <p className="text-sm text-gray-500">
                    Loại: {post.type === "post" ? "Bài đăng" : "Câu hỏi"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                Chưa có bài đăng hoặc câu hỏi nào.
              </p>
            )}
          </div>
        )}
        {activeTab === "courses" && (
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="text-lg font-bold text-[#34495e] mb-4">
              Khóa học của tôi
            </h3>
            {(user.role === "teacher" || user.role === "admin") && (
              <form onSubmit={handleCreateCourse} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-[#34495e]">
                    Tiêu đề khóa học
                  </label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, title: e.target.value })
                    }
                    className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#e74c3c] text-white py-2 rounded-full hover:bg-[#c0392b]"
                >
                  Tạo khóa học
                </button>
              </form>
            )}
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  key={course._id}
                  className="p-4 mb-2 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                >
                  <h4 className="text-base font-semibold text-[#34495e]">
                    {course.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Giảng viên: {course.instructorId?.username || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Trạng thái:{" "}
                    {course.status === "pending"
                      ? "Chờ duyệt"
                      : course.status === "approved"
                      ? "Đã duyệt"
                      : "Bị từ chối"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                Chưa tham gia hoặc tạo khóa học nào.
              </p>
            )}
          </div>
        )}
        {activeTab === "create-exam" &&
          (user.role === "teacher" || user.role === "admin") && (
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="text-lg font-bold text-[#34495e] mb-4">
                {editingExam ? "Chỉnh sửa đề thi" : "Tạo đề thi"}
              </h3>
              <form
                onSubmit={editingExam ? handleUpdateExam : handleCreateExam}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-[#34495e]">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    value={newExam.title}
                    onChange={(e) =>
                      setNewExam({ ...newExam, title: e.target.value })
                    }
                    className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#34495e]">Mô tả</label>
                  <textarea
                    value={newExam.description}
                    onChange={(e) =>
                      setNewExam({ ...newExam, description: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#34495e]">
                    Cấp học
                  </label>
                  <select
                    value={newExam.educationLevel}
                    onChange={(e) =>
                      setNewExam({ ...newExam, educationLevel: e.target.value })
                    }
                    className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  >
                    {[...Array(12).keys()].map((i) => (
                      <option key={i + 1} value={`grade${i + 1}`}>
                        Lớp {i + 1}
                      </option>
                    ))}
                    <option value="university">Đại học</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#34495e]">
                    Môn học
                  </label>
                  <select
                    value={newExam.subject}
                    onChange={(e) =>
                      setNewExam({ ...newExam, subject: e.target.value })
                    }
                    className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  >
                    <option value="math">Toán</option>
                    {newExam.educationLevel === "university" && (
                      <>
                        <option value="advanced_math">Toán cao cấp</option>
                        <option value="calculus">Giải tích</option>
                        <option value="algebra">Đại số</option>
                        <option value="probability_statistics">
                          Xác suất thống kê
                        </option>
                        <option value="differential_equations">
                          Phương trình vi phân
                        </option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#34495e]">
                    Thời gian (phút)
                  </label>
                  <input
                    type="number"
                    value={newExam.duration}
                    onChange={(e) =>
                      setNewExam({
                        ...newExam,
                        duration: Number(e.target.value),
                      })
                    }
                    min="1"
                    className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#34495e]">
                    Thời gian bắt đầu
                  </label>
                  <input
                    type="datetime-local"
                    value={newExam.startTime}
                    onChange={(e) =>
                      setNewExam({ ...newExam, startTime: e.target.value })
                    }
                    className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#34495e]">
                    Thời gian kết thúc
                  </label>
                  <input
                    type="datetime-local"
                    value={newExam.endTime}
                    onChange={(e) =>
                      setNewExam({ ...newExam, endTime: e.target.value })
                    }
                    className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#34495e]">Độ khó</label>
                  <select
                    value={newExam.difficulty}
                    onChange={(e) =>
                      setNewExam({ ...newExam, difficulty: e.target.value })
                    }
                    className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#e74c3c] text-white py-2 rounded-full hover:bg-[#c0392b]"
                  >
                    {editingExam ? "Cập nhật đề thi" : "Tạo đề thi"}
                  </button>
                  {editingExam && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExam(null);
                        setNewExam({
                          title: "",
                          description: "",
                          educationLevel: "grade1",
                          subject: "math",
                          duration: 60,
                          questions: [],
                          startTime: "",
                          endTime: "",
                          difficulty: "easy",
                        });
                      }}
                      className="flex-1 bg-gray-300 text-[#34495e] py-2 rounded-full hover:bg-gray-400"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
              <h3 className="text-lg font-bold text-[#34495e] mt-8 mb-4">
                Danh sách đề thi
              </h3>
              {myExams.length > 0 ? (
                myExams.map((exam) => (
                  <div
                    key={exam._id}
                    className="p-4 mb-2 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h4 className="text-base font-semibold text-[#34495e]">
                      {exam.title}
                    </h4>
                    <p className="text-sm text-gray-500">Môn: {exam.subject}</p>
                    <p className="text-sm text-gray-500">
                      Độ khó:{" "}
                      {exam.difficulty === "easy"
                        ? "Dễ"
                        : exam.difficulty === "medium"
                        ? "Trung bình"
                        : "Khó"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEditClick(exam)}
                        className="px-4 py-1 bg-[#e74c3c] text-white rounded-full hover:bg-[#c0392b]"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam._id)}
                        className="px-4 py-1 bg-gray-300 text-[#34495e] rounded-full hover:bg-gray-400"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Chưa có đề thi nào.</p>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default Profile;
