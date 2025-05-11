import React, { useState } from "react";
import { format } from "date-fns";
import "./Profile.css";

const OverviewTab = ({
  profileData,
  followers,
  following,
  contributions,
  selectedYear,
  handleYearChange,
  handleProfileChange,
  handleUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Generate years from account creation to current year
  const accountCreationYear = profileData.createdAt
    ? new Date(profileData.createdAt).getFullYear()
    : 2023;
  const currentYear = 2025;
  const years = [];
  for (let year = accountCreationYear; year <= currentYear; year++) {
    years.push(year);
  }

  // Mock recent activities (replace with actual data from API if available)
  const recentActivities = contributions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map((activity) => ({
      date: activity.date,
      description: `Đã thực hiện ${activity.count} hoạt động`,
    }));

  const toggleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="overview-tab">
      <div className="profile-and-activity">
        {/* Profile Information (Left) */}
        <div className="profile-header">
          <div className="profile-info">
            <img
              src={
                profileData.avatar ||
                "https://res.cloudinary.com/your-cloud-name/image/upload/avatar/default-avatar.jpg"
              }
              alt="Avatar"
              className="profile-avatar"
            />
            <h2>{profileData.username}</h2>
            {profileData.bio && (
              <p className="profile-bio">{profileData.bio}</p>
            )}
            <div className="badges">
              {profileData.badges?.map((badge, index) => (
                <span key={index} className={`badge badge-${badge.type}`}>
                  {badge.type === "gold"
                    ? "🥇"
                    : badge.type === "silver"
                    ? "🥈"
                    : "🥉"}
                </span>
              ))}
            </div>
            <p className="follow-stats">
              {followers.length} người theo dõi • {following.length} đang theo
              dõi
            </p>
            {!isEditing ? (
              <button className="edit-profile-btn" onClick={toggleEditProfile}>
                Chỉnh sửa hồ sơ
              </button>
            ) : (
              <form onSubmit={handleUpdateProfile} className="profile-details">
                <div>
                  <p>
                    <strong>Tên người dùng:</strong>
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      placeholder="Tên người dùng"
                    />
                  </p>
                  <p>
                    <strong>Email:</strong>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder="Email"
                    />
                  </p>
                  <p>
                    <strong>Bio:</strong>
                    <textarea
                      name="bio"
                      value={profileData.bio || ""}
                      onChange={handleProfileChange}
                      placeholder="Giới thiệu về bạn"
                      className="bio-input"
                    />
                  </p>
                  <p>
                    <strong>Ảnh đại diện:</strong>
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleProfileChange}
                    />
                  </p>
                </div>
                <div className="profile-actions">
                  <button type="submit" className="save-profile-btn">
                    Lưu
                  </button>
                  <button
                    type="button"
                    className="cancel-edit-btn"
                    onClick={toggleEditProfile}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Contribution Heatmap (Right) */}
        <div className="heatmap-section">
          <h3>
            {contributions.reduce((sum, day) => sum + day.count, 0)} hoạt động
            trong năm {selectedYear}
          </h3>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="year-select"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="heatmap-wrapper">
            <div className="heatmap-days">
              {["", "T2", "T4", "T6", "CN"].map((day, index) => (
                <span key={index}>{day}</span>
              ))}
            </div>
            <div className="flex-1">
              <div className="heatmap-header">
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
                  <span key={index}>{month}</span>
                ))}
              </div>
              <div className="heatmap">
                {contributions.map((day, index) => (
                  <div
                    key={index}
                    className={`heatmap-day contribution-${Math.min(
                      day.count,
                      4
                    )}`}
                    title={`${day.date}: ${day.count} hoạt động`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <div className="heatmap-legend">
            <span>Ít</span>
            <div className="legend-squares">
              <span className="heatmap-day contribution-0"></span>
              <span className="heatmap-day contribution-1"></span>
              <span className="heatmap-day contribution-2"></span>
              <span className="heatmap-day contribution-3"></span>
              <span className="heatmap-day contribution-4"></span>
            </div>
            <span>Nhiêu</span>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="recent-activities">
        <h3>Hoạt động gần đây</h3>
        {recentActivities.length > 0 ? (
          <ul>
            {recentActivities.map((activity, index) => (
              <li key={index} className="activity-item">
                <span>{format(new Date(activity.date), "dd/MM/yyyy")}</span>
                <p>{activity.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có hoạt động nào gần đây.</p>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
