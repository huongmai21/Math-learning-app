"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getUserProfile } from "../../services/userService";
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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Kiểm tra xem có phải profile của user hiện tại không
  const isCurrentUser = !id || (user && user._id === id);
  const profileId = id || (user ? user._id : null);

  useEffect(() => {
    if (!profileId) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(profileId);
        setProfile(data);
        setError(null);
      } catch (err) {
        setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileId, navigate, dispatch]);

  const renderTabContent = () => {
    if (loading) return <Spinner />;
    if (error) return <div className="error-message">{error}</div>;
    if (!profile)
      return <div className="error-message">Không tìm thấy hồ sơ</div>;

    switch (activeTab) {
      case "overview":
        return <OverviewTab profile={profile} isCurrentUser={isCurrentUser} />;
      case "stats":
        return profile.role === "student" ? (
          <StatsTab profile={profile} />
        ) : null;
      case "library":
        return <LibraryTab profile={profile} isCurrentUser={isCurrentUser} />;
      case "friends":
        return <FriendsTab profile={profile} isCurrentUser={isCurrentUser} />;
      case "posts":
        return <PostsTab profile={profile} isCurrentUser={isCurrentUser} />;
      case "courses":
        return <CoursesTab profile={profile} isCurrentUser={isCurrentUser} />;
      case "create-exam":
        return profile.role === "teacher" ? (
          <CreateExamTab profile={profile} />
        ) : null;
      default:
        return <OverviewTab profile={profile} isCurrentUser={isCurrentUser} />;
    }
  };

  return (
    <div className="profile-container">
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : profile ? (
        <>
          <div className="profile-header">
            <div className="profile-cover">
              <img
                src={
                  profile.coverImage || "/placeholder.svg?height=200&width=800"
                }
                alt="Cover"
                className="cover-image"
              />
            </div>
            <div className="profile-info">
              <div className="profile-avatar">
                <img
                  src={
                    profile.avatar || "/placeholder.svg?height=100&width=100"
                  }
                  alt={profile.username}
                />
              </div>
              <div className="profile-details">
                <h1>{profile.username}</h1>
                <p className="profile-role">
                  {profile.role === "student" ? "Học sinh" : "Giáo viên"}
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
            <div className="profile-sidebar">
              <ul className="profile-nav">
                <li
                  className={activeTab === "overview" ? "active" : ""}
                  onClick={() => setActiveTab("overview")}
                >
                  <i className="fas fa-user"></i> Tổng quan
                </li>

                {profile.role === "student" && (
                  <li
                    className={activeTab === "stats" ? "active" : ""}
                    onClick={() => setActiveTab("stats")}
                  >
                    <i className="fas fa-chart-line"></i> Thống kê
                  </li>
                )}

                <li
                  className={activeTab === "library" ? "active" : ""}
                  onClick={() => setActiveTab("library")}
                >
                  <i className="fas fa-book"></i> Thư viện
                </li>

                <li
                  className={activeTab === "friends" ? "active" : ""}
                  onClick={() => setActiveTab("friends")}
                >
                  <i className="fas fa-users"></i> Bạn bè
                </li>

                <li
                  className={activeTab === "posts" ? "active" : ""}
                  onClick={() => setActiveTab("posts")}
                >
                  <i className="fas fa-comments"></i> Học tập
                </li>

                <li
                  className={activeTab === "courses" ? "active" : ""}
                  onClick={() => setActiveTab("courses")}
                >
                  <i className="fas fa-graduation-cap"></i> Khóa học
                </li>

                {profile.role === "teacher" && (
                  <li
                    className={activeTab === "create-exam" ? "active" : ""}
                    onClick={() => setActiveTab("create-exam")}
                  >
                    <i className="fas fa-file-alt"></i> Tạo đề thi
                  </li>
                )}
              </ul>
            </div>

            <div className="profile-tab-content">{renderTabContent()}</div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Profile;
