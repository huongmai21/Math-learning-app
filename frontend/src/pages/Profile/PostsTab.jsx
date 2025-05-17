import React from "react";
import "./Profile.css";

const PostsTab = ({
  posts,
  notifications,
  handleMarkNotificationRead,
  unreadNotificationsCount,
}) => {
  return (
    <div className="posts-tab">
      <h3>
        Bài đăng và câu hỏi đã tạo{" "}
        {unreadNotificationsCount > 0 && (
          <span className="text-red-500">
            ({unreadNotificationsCount} thông báo chưa đọc)
          </span>
        )}
      </h3>
      {posts.length > 0 ? (
        posts.map((post) => {
          const relatedNotifications = notifications.filter(
            (n) => n.relatedId?.toString() === post._id?.toString() && !n.isRead
          );
          return (
            <div key={post._id} className="post-item">
              <h4>{post.title}</h4>
              <p>{post.content}</p>
              <p>Loại: {post.type === "post" ? "Bài đăng" : "Câu hỏi"}</p>
              {relatedNotifications.length > 0 && (
                <div className="notifications-section">
                  <p className="notification-count">
                    Có {relatedNotifications.length} thông báo mới:
                  </p>
                  <ul>
                    {relatedNotifications.map((notification) => (
                      <li key={notification._id}>{notification.message}</li>
                    ))}
                  </ul>
                  <button
                    className="mark-read-btn"
                    onClick={() =>
                      relatedNotifications.forEach((n) =>
                        handleMarkNotificationRead(n._id)
                      )
                    }
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>
              )}
            </div>
          );
        })
      ) : (
        <p>Chưa có bài đăng hoặc câu hỏi nào.</p>
      )}
    </div>
  );
};

export default PostsTab;
