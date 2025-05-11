// frontend/src/pages/PostsTab.jsx
import React from "react";
import './Profile.css';

const PostsTab = ({
  posts,
  newPost,
  setNewPost,
  handleCreatePost,
  notifications,
  handleMarkNotificationRead,
  unreadNotificationsCount,
}) => {
  return (
    <div className="posts-tab">
      <h3>
        Bài đăng và câu hỏi bài tập{" "}
        {unreadNotificationsCount > 0 && (
          <span className="text-red-500">
            ({unreadNotificationsCount} chưa đọc)
          </span>
        )}
      </h3>
      <form onSubmit={handleCreatePost} className="mb-6">
        <div className="mb-4">
          <label className="block text-sm">Tiêu đề</label>
          <input
            type="text"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Nội dung</label>
          <textarea
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Loại</label>
          <select
            value={newPost.type}
            onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="post">Bài đăng</option>
            <option value="question">Câu hỏi</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-[#0366d6] text-white rounded hover:bg-[#024ea4]"
        >
          Đăng bài
        </button>
      </form>
      {posts.length > 0 ? (
        posts.map((post) => {
          const relatedNotifications = notifications.filter(
            (n) =>
              n.relatedId?.toString() === post._id?.toString() && !n.isRead
          );
          return (
            <div key={post._id} className="post-item">
              <h4>{post.title}</h4>
              <p>{post.content}</p>
              <p>Loại: {post.type === "post" ? "Bài đăng" : "Câu hỏi"}</p>
              {relatedNotifications.length > 0 && (
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