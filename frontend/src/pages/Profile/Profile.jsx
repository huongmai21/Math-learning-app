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
import { format } from "date-fns";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import OverviewTab from "./OverviewTab";
import StatsTab from "./StatsTab";
import LibraryTab from "./LibraryTab";
import FriendsTab from "./FriendsTab";
import PostsTab from "./PostsTab";
import CoursesTab from "./CoursesTab";
import CreateExamTab from "./CreateExamTab";

// Import các service cần thiết
import {
  getProfile,
  getContributions,
  getFollowers,
  getFollowing,
} from "../../services/userService";
import {
  getScores,
  getBookmarks,
  getPosts,
  getCourses,
  getParticipatedExams,
} from "../../services/profileService";
import {
  createExam,
  updateExam,
  deleteExam,
  getMyExams,
} from "../../services/examService";
import {
  getNotifications,
  markNotificationRead,
} from "../../services/notificationService";
import api from "../../services/api";

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
  const [libraryItems, setBookmarks] = useState([]);
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
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setLoading(false);
      console.log("No token found, user not logged in.");
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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching profile...");
      const profile = await getProfile();
      console.log("Profile data:", profile);
      setProfileData(profile);

      console.log("Fetching contributions...");
      const activity = await getContributions(selectedYear);
      console.log("Contributions data:", activity);
      setContributions(activity.activity || []);

      console.log("Fetching scores...");
      const scoresData = await getScores();
      console.log("Scores data:", scoresData);
      setScores(
        scoresData.data?.map((score) => ({
          date: format(new Date(score.date), "yyyy-MM"),
          score: score.score,
          examTitle: score.examId?.title || score.courseId?.title,
        })) || []
      );

      if (profile?.role === "student") {
        console.log("Fetching participated exams...");
        const examsData = await getParticipatedExams();
        console.log("Participated exams data:", examsData);
        setParticipatedExams(examsData.data || []);
      }

      console.log("Fetching library items...");
      const libraryData = await getBookmarks();
      console.log("Library data:", libraryData);
      setBookmarks(libraryData.data || []);

      console.log("Fetching followers...");
      const followersData = await getFollowers();
      console.log("Followers data:", followersData);
      setFollowers(followersData || []);

      console.log("Fetching following...");
      const followingData = await getFollowing();
      console.log("Following data:", followingData);
      setFollowing(followingData || []);

      console.log("Fetching posts...");
      const postsData = await getPosts();
      console.log("Posts data:", postsData);
      setPosts(postsData.data || []);

      console.log("Fetching courses...");
      const coursesData = await getCourses();
      console.log("Courses data:", coursesData);
      setCourses(coursesData.data || []);

      if (profile?.role === "teacher" || profile?.role === "admin") {
        console.log("Fetching my exams...");
        const examsData = await getMyExams(profile._id);
        console.log("My exams data:", examsData);
        setMyExams(examsData.exams || []);
      }

      console.log("Fetching notifications...");
      const notificationsData = await getNotifications(profile._id);
      console.log("Notifications data:", notificationsData);
      setNotifications(notificationsData.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
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
    if (name === "avatar" && files && files[0]) {
      setPreviewAvatar(URL.createObjectURL(files[0]));
      setProfileData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", profileData.username);
    formData.append("email", profileData.email);
    formData.append("bio", profileData.bio || "");
    if (profileData.avatar && typeof profileData.avatar !== "string") {
      formData.append("avatar", profileData.avatar);
    }

    try {
      const response = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Cập nhật hồ sơ thành công!");
      setProfileData(response.data.data);
      setPreviewAvatar(null);
    } catch (err) {
      toast.error(err.message || "Cập nhật hồ sơ thất bại!");
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const response = await createExam(newExam);
      setMyExams([...myExams, response.exam]);
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
      const response = await updateExam(editingExam._id, newExam);
      setMyExams(
        myExams.map((exam) =>
          exam._id === editingExam._id ? response.exam : exam
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
      await deleteExam(examId);
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
      await markNotificationRead(notificationId);
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
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="error">
        {error}. Vui lòng thử lại hoặc liên hệ hỗ trợ.
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="login-message">Vui lòng đăng nhập để xem hồ sơ.</div>
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
            previewAvatar={previewAvatar}
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
        {activeTab === "library" && <LibraryTab libraryItems={libraryItems} />}
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
            notifications={notifications}
            handleMarkNotificationRead={handleMarkNotificationRead}
            unreadNotificationsCount={unreadNotificationsCount}
          />
        )}
        {activeTab === "courses" && (
          <CoursesTab profileData={profileData} courses={courses} />
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
