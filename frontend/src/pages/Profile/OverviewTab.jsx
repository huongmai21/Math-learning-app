import { Link } from "react-router-dom";

const OverviewTab = ({ profile, isCurrentUser, contributions = [] }) => {
  // Tạo dữ liệu cho biểu đồ đóng góp
  const getContributionLevel = (count) => {
    if (count === 0) return "level-0";
    if (count <= 2) return "level-1";
    if (count <= 5) return "level-2";
    if (count <= 8) return "level-3";
    return "level-4";
  };

  // Tạo mảng tuần cho biểu đồ đóng góp
  const getContributionWeeks = () => {
    // Sắp xếp contributions theo ngày
    const sortedContributions = [...contributions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // Nhóm theo tuần
    const weeks = [];
    let currentWeek = [];

    sortedContributions.forEach((contribution, index) => {
      if (index % 7 === 0 && index !== 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(contribution);
    });

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks.slice(-52); // Lấy 52 tuần gần nhất
  };

  const contributionWeeks = getContributionWeeks();

  // Tính tổng đóng góp
  const totalContributions = contributions.reduce(
    (sum, item) => sum + item.count,
    0
  );

  return (
    <div className="overview-tab">
      <div className="overview-grid">
        <section className="profile-section user-info-section">
          <h2>Thông tin cá nhân</h2>
          <div className="profile-info-grid">
            <div className="info-item">
              <span className="info-label">Tên người dùng</span>
              <span className="info-value">{profile.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{profile.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Vai trò</span>
              <span className="info-value">
                {profile.role === "student"
                  ? "Học sinh"
                  : profile.role === "teacher"
                  ? "Giáo viên"
                  : "Quản trị viên"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Ngày tham gia</span>
              <span className="info-value">
                {new Date(profile.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <section className="profile-section">
            <h2>Hoạt động gần đây</h2>
            {isCurrentUser ? (
              <div className="activity-timeline">
                {contributions.length > 0 ? (
                  contributions.slice(0, 5).map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        <i className="fas fa-code-branch"></i>
                      </div>
                      <div className="activity-content">
                        <p>
                          Bạn đã có <strong>{activity.count}</strong> đóng góp
                        </p>
                        <span className="activity-time">{activity.date}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Chưa có hoạt động nào gần đây.</p>
                )}
              </div>
            ) : (
              <p>Không có quyền xem hoạt động của người dùng này.</p>
            )}
          </section>

          {isCurrentUser && (
            <section className="profile-actions">
              <Link to="/documents/create" className="btn-primary">
                <i className="fas fa-file-alt"></i> Tạo tài liệu mới
              </Link>
              {profile.role === "teacher" && (
                <Link to="/courses/create" className="btn-primary">
                  <i className="fas fa-graduation-cap"></i> Tạo khóa học mới
                </Link>
              )}
              <Link to="/study-corner" className="btn-secondary">
                <i className="fas fa-comments"></i> Đến góc học tập
              </Link>
            </section>
          )}
        </section>

        {isCurrentUser && (
          <section className="profile-section contribution-section">
            <h2>Đóng góp</h2>
            <div className="contribution-stats">
              <p>
                <strong>{totalContributions}</strong> đóng góp trong năm qua
              </p>
              <div className="contribution-grid">
                {contributionWeeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="contribution-week">
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`contribution-day ${getContributionLevel(
                          day.count
                        )}`}
                        title={`${day.date}: ${day.count} đóng góp`}
                      ></div>
                    ))}
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
          </section>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
