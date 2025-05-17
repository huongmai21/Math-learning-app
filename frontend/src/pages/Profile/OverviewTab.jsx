import { Link } from "react-router-dom";

const OverviewTab = ({ profile, isCurrentUser }) => {
  return (
    <div className="overview-tab">
      <div className="profile-section">
        <h2>Thông tin cá nhân</h2>
        <div className="profile-info-grid">
          <div className="info-item">
            <span className="info-label">Tên người dùng:</span>
            <span className="info-value">{profile.username}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{profile.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Vai trò:</span>
            <span className="info-value">
              {profile.role === "student" ? "Học sinh" : "Giáo viên"}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Ngày tham gia:</span>
            <span className="info-value">
              {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
          {profile.location && (
            <div className="info-item">
              <span className="info-label">Địa điểm:</span>
              <span className="info-value">{profile.location}</span>
            </div>
          )}
          {profile.education && (
            <div className="info-item">
              <span className="info-label">Trường học:</span>
              <span className="info-value">{profile.education}</span>
            </div>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h2>Hoạt động gần đây</h2>
        {profile.recentActivities && profile.recentActivities.length > 0 ? (
          <div className="activity-timeline">
            {profile.recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <i className={`fas fa-${getActivityIcon(activity.type)}`}></i>
                </div>
                <div className="activity-content">
                  <p>{activity.description}</p>
                  <span className="activity-time">
                    {formatTimeAgo(activity.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-data">Chưa có hoạt động nào gần đây</p>
        )}
      </div>

      <div className="profile-section">
        <h2>Thống kê đóng góp</h2>
        <div className="contribution-stats">
          <div className="contribution-grid">
            {/* Giả lập dữ liệu đóng góp giống GitHub */}
            {Array.from({ length: 52 }, (_, weekIndex) => (
              <div key={`week-${weekIndex}`} className="contribution-week">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const level = Math.floor(Math.random() * 5); // 0-4 levels of contribution
                  return (
                    <div
                      key={`day-${weekIndex}-${dayIndex}`}
                      className={`contribution-day level-${level}`}
                      title={`${level} đóng góp vào ngày này`}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="contribution-legend">
            <span>Ít hơn</span>
            <div className="contribution-day level-0"></div>
            <div className="contribution-day level-1"></div>
            <div className="contribution-day level-2"></div>
            <div className="contribution-day level-3"></div>
            <div className="contribution-day level-4"></div>
            <span>Nhiều hơn</span>
          </div>
        </div>
      </div>

      {isCurrentUser && (
        <div className="profile-actions">
          <Link to="/settings" className="btn-secondary">
            <i className="fas fa-cog"></i> Cài đặt tài khoản
          </Link>
        </div>
      )}
    </div>
  );
};

// Hàm phụ trợ để lấy icon cho từng loại hoạt động
const getActivityIcon = (type) => {
  switch (type) {
    case "course":
      return "graduation-cap";
    case "document":
      return "file-alt";
    case "comment":
      return "comment";
    case "exam":
      return "clipboard-check";
    case "post":
      return "edit";
    default:
      return "circle";
  }
};

// Hàm phụ trợ để định dạng thời gian
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return "vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} năm trước`;
};

export default OverviewTab;
