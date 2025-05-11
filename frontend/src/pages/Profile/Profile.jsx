import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
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
import axios from "axios"; // Thêm axios
import api from "../../services/api";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import { format } from "date-fns";
import { getNotifications } from "../../services/notificationService";
import {
  getScores,
  getLibraryItems,
  getPosts,
  getCourses,
  getParticipatedExams,
  addLibraryItem,
  createPost,
  createCourse,
} from "../../services/profileService";
import OverviewTab from "./OverviewTab";
import StatsTab from "./StatsTab";
import LibraryTab from "./LibraryTab";
import FriendsTab from "./FriendsTab";
import PostsTab from "./PostsTab";
import CoursesTab from "./CoursesTab";
import CreateExamTab from "./CreateExamTab";

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
  const { user: reduxUser, token } = useSelector((state) => state.auth);
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
  const [participatedExams, setParticipatedExams] = useState([]);
  const [notifications, setNotifications] = useState([]);
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
  const [profileData, setProfileData] = useState(null);
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
    if (token) {
      fetchData();
    }
  }, [selectedYear, token]);

  useEffect(() => {
    if (profileData) {
      socket.emit("join", profileData._id);
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
      socket.on("newNotification", (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });
    }
    return () => {
      socket.off("reminder");
      socket.off("newNotification");
    };
  }, [profileData]);

  useEffect(() => {
    const fetchExams = async () => {
      if (
        activeTab === "create-exam" &&
        (profileData?.role === "teacher" || profileData?.role === "admin")
      ) {
        try {
          const response = await api.get(`/exams?author=${profileData._id}`);
          setMyExams(response.data.exams);
        } catch (err) {
          toast.error(
            "Lỗi khi lấy danh sách đề thi: " +
              (err.message || "Vui lòng thử lại.")
          );
        }
      }
    };
    if (token) fetchExams();
  }, [activeTab, profileData, token]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileRes = await api.get("/users/profile");
      setProfileData(profileRes.data);

      const activityRes = await api.get(`/users/activity?year=${selectedYear}`);
      setContributions(activityRes.data.activity);

      const scoresRes = await getScores();
      setScores(
        scoresRes.data.map((score) => ({
          date: format(new Date(score.date), "yyyy-MM"),
          score: score.score,
          examTitle: score.examId?.title || score.courseId?.title,
        }))
      );

      if (profileRes.data?.role === "student") {
        const examsRes = await getParticipatedExams();
        setParticipatedExams(examsRes.data || []);
      }

      const notificationsRes = await getNotifications(profileRes.data._id);
      setNotifications(notificationsRes.data || []);

      const libraryRes = await getLibraryItems();
      setLibraryItems(libraryRes.data);

      const followersRes = await api.get("/users/followers");
      setFollowers(followersRes.data);
      const followingRes = await api.get("/users/following");
      setFollowing(followingRes.data);

      const postsRes = await getPosts();
      setPosts(postsRes.data);

      const coursesRes = await getCourses();
      setCourses(coursesRes.data);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu!");
    } finally {
      setLoading(false);
    }
  };

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
    try {
      let avatarUrl = profileData.avatar;

      // Upload avatar to Cloudinary if a new file is selected
      if (profileData.avatar && typeof profileData.avatar !== "string") {
        const formData = new FormData();
        formData.append("file", profileData.avatar);
        formData.append("upload_preset", "your_upload_preset"); // Thay bằng upload preset của bạn
        formData.append("folder", "avatar"); // Lưu vào thư mục avatar/

        const cloudinaryRes = await axios.post(
          "https://api.cloudinary.com/v1_1/your-cloud-name/image/upload", // Thay your-cloud-name bằng tên cloud của bạn
          formData
        );
        avatarUrl = cloudinaryRes.data.secure_url;
      }

      // Prepare data to update profile
      const data = new FormData();
      data.append("username", profileData.username);
      data.append("email", profileData.email);
      data.append("bio", profileData.bio || "");
      if (avatarUrl) {
        data.append("avatar", avatarUrl);
      }

      const response = await api.put("/users", data);
      toast.success("Cập nhật hồ sơ thành công!");
      setProfileData({
        ...response.data.data,
        avatar: avatarUrl || response.data.data.avatar,
      });
    } catch (err) {
      toast.error(err.message || "Cập nhật hồ sơ thất bại!");
    }
  };

  const handleAddLibraryItem = async (e) => {
    e.preventDefault();
    try {
      const response = await addLibraryItem(newLibraryItem);
      setLibraryItems([...libraryItems, response.data]);
      setNewLibraryItem({ title: "", type: "document", url: "" });
      toast.success("Thêm tài liệu/tin tức thành công!");
    } catch (err) {
      toast.error(
        "Thêm tài liệu/tin tức thất bại: " +
          (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const response = await createPost(newPost);
      setPosts([...posts, response.data]);
      setNewPost({ title: "", content: "", type: "post" });
      toast.success("Tạo bài đăng/câu hỏi thành công!");
    } catch (err) {
      toast.error(
        "Tạo bài đăng/câu hỏi thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await createCourse(newCourse);
      setCourses([...courses, response.data]);
      setNewCourse({ title: "" });
      toast.success("Tạo khóa học thành công!");
    } catch (err) {
      toast.error(
        "Tạo khóa học thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/exams", newExam);
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
        "Tạo đề thi thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/exams/${editingExam._id}`, newExam);
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
        "Cập nhật đề thi thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleDeleteExam = async (examId) => {
    try {
      await api.delete(`/exams/${examId}`);
      setMyExams(myExams.filter((exam) => exam._id !== examId));
      toast.success("Xóa đề thi thành công!");
    } catch (err) {
      toast.error(
        "Xóa đề thi thất bại: " + (err.message || "Vui lòng thử lại.")
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

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      toast.error("Không thể đánh dấu thông báo đã đọc: " + err.message);
    }
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

  const unreadNotificationsCount = notifications.filter(
    (n) => !n.isRead
  ).length;

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        {error}. Vui lòng thử lại hoặc liên hệ hỗ trợ.
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-10">Vui lòng đăng nhập để xem hồ sơ.</div>
    );
  }

  return (
    <div className="profile-page">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={profileData}
        tabs="profile"
      />
      <div className="profile-content">
        {activeTab === "overview" && (
          <OverviewTab
            profileData={profileData}
            followers={followers}
            following={following}
            contributions={contributions}
            selectedYear={selectedYear}
            handleYearChange={handleYearChange}
            handleProfileChange={handleProfileChange}
            handleUpdateProfile={handleUpdateProfile}
          />
        )}
        {activeTab === "stats" && profileData.role === "student" && (
          <StatsTab
            scores={scores}
            participatedExams={participatedExams}
            scoreChartData={scoreChartData}
            scoreChartOptions={scoreChartOptions}
          />
        )}
        {activeTab === "library" && (
          <LibraryTab
            libraryItems={libraryItems}
            newLibraryItem={newLibraryItem}
            setNewLibraryItem={setNewLibraryItem}
            handleAddLibraryItem={handleAddLibraryItem}
          />
        )}
        {activeTab === "friends" && (
          <FriendsTab
            friendsFilter={friendsFilter}
            setFriendsFilter={setFriendsFilter}
            friendsSearchQuery={friendsSearchQuery}
            setFriendsSearchQuery={setFriendsSearchQuery}
            followers={followers}
            following={following}
          />
        )}
        {activeTab === "posts" && (
          <PostsTab
            posts={posts}
            newPost={newPost}
            setNewPost={setNewPost}
            handleCreatePost={handleCreatePost}
            notifications={notifications}
            handleMarkNotificationRead={handleMarkNotificationRead}
            unreadNotificationsCount={unreadNotificationsCount}
          />
        )}
        {activeTab === "courses" && (
          <CoursesTab
            profileData={profileData}
            courses={courses}
            newCourse={newCourse}
            setNewCourse={setNewCourse}
            handleCreateCourse={handleCreateCourse}
          />
        )}
        {activeTab === "create-exam" &&
          (profileData.role === "teacher" || profileData.role === "admin") && (
            <CreateExamTab
              profileData={profileData}
              myExams={myExams}
              newExam={newExam}
              setNewExam={setNewExam}
              editingExam={editingExam}
              setEditingExam={setEditingExam}
              handleCreateExam={handleCreateExam}
              handleUpdateExam={handleUpdateExam}
              handleEditClick={handleEditClick}
              handleDeleteExam={handleDeleteExam}
            />
          )}
      </div>
    </div>
  );
};

export default Profile;
