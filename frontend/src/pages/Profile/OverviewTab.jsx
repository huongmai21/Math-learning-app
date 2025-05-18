"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  getUserProfile,
  getScores,
  getContributions,
} from "../../services/userService";
import { toast } from "react-toastify";
import "./Profile.css";

const OverviewTab = ({ userId }) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [userProfile, setUserProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const targetUserId = userId || (currentUser ? currentUser._id : null);

        if (!targetUserId) {
          toast.error("Không thể tải thông tin người dùng");
          setLoading(false);
          return;
        }

        // Lấy thông tin hồ sơ
        const profileData = await getUserProfile(targetUserId);
        setUserProfile(profileData.data);

        // Lấy điểm số
        const scoresData = await getScores(targetUserId);
        setScores(scoresData.data || []);

        // Lấy đóng góp
        const contributionsData = await getContributions(targetUserId);
        setContributions(contributionsData.data || []);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast.error("Không thể tải thông tin hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, currentUser]);

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  if (!userProfile) {
    return (
      <div className="error-message">Không thể tải thông tin người dùng</div>
    );
  }

  return (
    <div className="overview-tab">
      <div className="profile-section">
        <h3>Thông tin cá nhân</h3>
        <div className="profile-info">
          <div className="info-item">
            <span className="label">Tên người dùng:</span>
            <span className="value">{userProfile.username}</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">{userProfile.email}</span>
          </div>
          <div className="info-item">
            <span className="label">Vai trò:</span>
            <span className="value">
              {userProfile.role === "student"
                ? "Học sinh"
                : userProfile.role === "teacher"
                ? "Giáo viên"
                : "Quản trị viên"}
            </span>
          </div>
          {userProfile.bio && (
            <div className="info-item">
              <span className="label">Giới thiệu:</span>
              <span className="value">{userProfile.bio}</span>
            </div>
          )}
          <div className="info-item">
            <span className="label">Ngày tham gia:</span>
            <span className="value">
              {new Date(userProfile.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h3>Thống kê</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <div className="stat-info">
              <h4>Khóa học</h4>
              <p>{userProfile.enrolledCourses?.length || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="stat-info">
              <h4>Tài liệu</h4>
              <p>{userProfile.documents?.length || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <div className="stat-info">
              <h4>Đề thi</h4>
              <p>{userProfile.exams?.length || 0}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <h4>Người theo dõi</h4>
              <p>{userProfile.followers?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {scores.length > 0 && (
        <div className="scores-section">
          <h3>Điểm số gần đây</h3>
          <div className="scores-list">
            {scores.slice(0, 5).map((score, index) => (
              <div key={index} className="score-item">
                <div className="score-info">
                  <h4>{score.examTitle}</h4>
                  <p>
                    Điểm:{" "}
                    <span className="highlight">
                      {score.score}/{score.totalScore}
                    </span>
                  </p>
                </div>
                <div className="score-date">
                  {new Date(score.date).toLocaleDateString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {contributions.length > 0 && (
        <div className="contributions-section">
          <h3>Đóng góp gần đây</h3>
          <div className="contributions-list">
            {contributions.slice(0, 5).map((contribution, index) => (
              <div key={index} className="contribution-item">
                <div className="contribution-icon">
                  <i
                    className={`fas ${
                      contribution.type === "document"
                        ? "fa-file-alt"
                        : contribution.type === "exam"
                        ? "fa-clipboard-list"
                        : "fa-comment-alt"
                    }`}
                  ></i>
                </div>
                <div className="contribution-info">
                  <h4>{contribution.title}</h4>
                  <p>{contribution.description}</p>
                </div>
                <div className="contribution-date">
                  {new Date(contribution.date).toLocaleDateString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
