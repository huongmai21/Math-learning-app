"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getUserProfile,
  getFollowers,
  getFollowing,
  getLibrary,
  getPosts,
  getScores,
  getContributions,
} from "../../services/userService";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";
import { createCourse } from "../../services/courseService";
import {
  createExam,
  getMyExams,
  updateExam,
  deleteExam,
} from "../../services/examService";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import OverviewTab from "./OverviewTab";
import StatsTab from "./StatsTab";
import LibraryTab from "./LibraryTab";
import FriendsTab from "./FriendsTab";
import PostsTab from "./PostsTab";
import CoursesTab from "./CoursesTab";
import CreateExamTab from "./CreateExamTab";
import Spinner from "../../components/ui/Spinner";
import "./Profile.css";

const Profile = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [libraryItems, setLibraryItems] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [courses, setCourses] = useState([]);
  const [scores, setScores] = useState([]);
  const [participatedExams, setParticipatedExams] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [friendsFilter, setFriendsFilter] = useState("followers");
  const [friendsSearchQuery, setFriendsSearchQuery] = useState("");
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    price: 0,
    isPublic: true,
  });
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

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Kiểm tra xem có phải profile của user hiện tại không
  const isCurrentUser = !id || (user && user._id === id);
  const profileId = id || (user ? user._id : null);

  useEffect(() => {
    if (!profileId) {
      navigate("/auth/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Fetch profile data
        try {
          const profileData = await getUserProfile(profileId);
          setProfile(profileData);
        } catch (error) {
          console.error("Error fetching profile:", error);
          setError("Không thể tải thông tin hồ sơ");
          return;
        }

        if (isCurrentUser) {
          // Fetch followers and following
          try {
            const followersData = await getFollowers();
            setFollowers(followersData.followers || []);
          } catch (error) {
            console.error("Error fetching followers:", error);
            setFollowers([]);
          }

          try {
            const followingData = await getFollowing();
            setFollowing(followingData.following || []);
          } catch (error) {
            console.error("Error fetching following:", error);
            setFollowing([]);
          }

          // Fetch library items
          try {
            const libraryData = await getLibrary();
            setLibraryItems(libraryData.items || []);
          } catch (error) {
            console.error("Error fetching library:", error);
            setLibraryItems([]);
          }

          // Fetch posts
          try {
            const postsData = await getPosts();
            setPosts(postsData.posts || []);
          } catch (error) {
            console.error("Error fetching posts:", error);
            setPosts([]);
          }

          // Fetch notifications
          try {
            const notificationsData = await getNotifications(user._id);
            setNotifications(notificationsData.data || []);
            setUnreadNotificationsCount(
              notificationsData.data.filter((n) => !n.isRead).length || 0
            );
          } catch (error) {
            console.error("Error fetching notifications:", error);
            setNotifications([]);
            setUnreadNotificationsCount(0);
          }

          // Fetch scores and exams if student
          if (user.role === "student") {
            try {
              const scoresData = await getScores();
              setScores(scoresData.scores || []);
              setParticipatedExams(scoresData.exams || []);
            } catch (error) {
              console.error("Error fetching scores:", error);
              setScores([]);
              setParticipatedExams([]);
            }
          }

          // Fetch contributions
          try {
            const contributionsData = await getContributions();
            setContributions(contributionsData.contributions || []);
          } catch (error) {
            console.error("Error fetching contributions:", error);
            setContributions([]);
          }

          // Fetch my exams if teacher
          if (user.role === "teacher") {
            try {
              const examsData = await getMyExams();
              setMyExams(examsData.exams || []);
            } catch (error) {
              console.error("Error fetching my exams:", error);
              setMyExams([]);
            }
          }
        }

        setError(null);
      } catch (err) {
        setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.");
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId, navigate, dispatch, isCurrentUser, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadNotificationsCount((prev) => prev - 1);
      toast.success("Đã đánh dấu thông báo là đã đọc");
    } catch (err) {
      toast.error("Không thể cập nhật thông báo");
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title) {
      toast.error("Vui lòng nhập tiêu đề khóa học");
      return;
    }

    try {
      const response = await createCourse(newCourse);
      setCourses([response.data, ...courses]);
      setNewCourse({
        title: "",
        description: "",
        price: 0,
        isPublic: true,
      });
      toast.success("Tạo khóa học thành công! Đang chờ duyệt.");
    } catch (err) {
      toast.error(
        "Không thể tạo khóa học: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!newExam.title || !newExam.startTime || !newExam.endTime) {
      toast.error("Vui lòng điền đầy đủ thông tin đề thi");
      return;
    }

    try {
      const response = await createExam(newExam);
      setMyExams([response.data, ...myExams]);
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
      toast.success("Tạo đề thi thành công! Đang chờ duyệt.");
    } catch (err) {
      toast.error(
        "Không thể tạo đề thi: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    if (!editingExam || !newExam.title) {
      toast.error("Vui lòng điền đầy đủ thông tin đề thi");
      return;
    }

    try {
      const response = await updateExam(editingExam, newExam);
      setMyExams(
        myExams.map((exam) => (exam._id === editingExam ? response.data : exam))
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
        "Không thể cập nhật đề thi: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const handleEditClick = (exam) => {
    setEditingExam(exam._id);
    setNewExam({
      title: exam.title,
      description: exam.description || "",
      educationLevel: exam.educationLevel || "grade1",
      subject: exam.subject || "math",
      duration: exam.duration || 60,
      questions: exam.questions || [],
      startTime: exam.startTime
        ? new Date(exam.startTime).toISOString().slice(0, 16)
        : "",
      endTime: exam.endTime
        ? new Date(exam.endTime).toISOString().slice(0, 16)
        : "",
      difficulty: exam.difficulty || "easy",
    });
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return;

    try {
      await deleteExam(examId);
      setMyExams(myExams.filter((exam) => exam._id !== examId));
      toast.success("Xóa đề thi thành công!");
    } catch (err) {
      toast.error(
        "Không thể xóa đề thi: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile)
    return <div className="error-message">Không tìm thấy hồ sơ</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-cover">
          <img
            src={profile.coverImage || "/placeholder.svg?height=200&width=800"}
            alt="Cover"
            className="cover-image"
          />
        </div>
        <div className="profile-info">
          <div className="profile-avatar">
            <img
              src={profile.avatar || "/placeholder.svg?height=100&width=100"}
              alt={profile.username}
            />
          </div>
          <div className="profile-details">
            <h1>{profile.username}</h1>
            <p className="profile-role">
              {profile.role === "student"
                ? "Học sinh"
                : profile.role === "teacher"
                ? "Giáo viên"
                : "Quản trị viên"}
            </p>
            <p className="profile-bio">
              {profile.bio || "Chưa có thông tin giới thiệu"}
            </p>

            {isCurrentUser ? (
              <button className="edit-profile-btn">
                <i className="fas fa-edit"></i> Chỉnh sửa hồ sơ
              </button>
            ) : (
              <button className="follow-btn">
                <i className="fas fa-user-plus"></i> Theo dõi
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-content">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={profile}
          tabs="profile"
        />

        <div className="profile-tab-content">
          {activeTab === "overview" && (
            <OverviewTab
              profile={profile}
              isCurrentUser={isCurrentUser}
              contributions={contributions}
            />
          )}

          {activeTab === "stats" && profile.role === "student" && (
            <StatsTab scores={scores} participatedExams={participatedExams} />
          )}

          {activeTab === "library" && (
            <LibraryTab libraryItems={libraryItems} />
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
              notifications={notifications}
              handleMarkNotificationRead={handleMarkNotificationRead}
              unreadNotificationsCount={unreadNotificationsCount}
            />
          )}

          {activeTab === "courses" && (
            <CoursesTab
              profileData={profile}
              courses={courses}
              newCourse={newCourse}
              setNewCourse={setNewCourse}
              handleCreateCourse={handleCreateCourse}
            />
          )}

          {activeTab === "create-exam" && profile.role === "teacher" && (
            <CreateExamTab
              profileData={profile}
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
    </div>
  );
};

export default Profile;
