import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getBookmarks, removeBookmark } from "../../services/documentService";
import "./Bookmark.css";

const BookmarkList = ({ userId }) => {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await getBookmarks();
        setBookmarks(response.data);
      } catch (err) {
        toast.error("Không thể tải danh sách đánh dấu!");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookmarks();
  }, [userId]);

  const handleRemoveBookmark = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh dấu này?")) return;
    try {
      await removeBookmark(id);
      setBookmarks(bookmarks.filter((bookmark) => bookmark.referenceId !== id));
      toast.success("Đã xóa đánh dấu!");
    } catch (err) {
      toast.error("Không thể xóa đánh dấu!");
    }
  };

  if (isLoading) return <p className="loading-text">Đang tải danh sách đánh dấu...</p>;
  if (bookmarks.length === 0) return <p className="no-bookmarks">Chưa có tài liệu nào được đánh dấu.</p>;

  return (
    <div className="bookmark-list">
      <h3 className="bookmark-title">Tài liệu đã đánh dấu</h3>
      <div className="bookmark-grid">
        {bookmarks.map((bookmark) => (
          <div key={bookmark._id} className="bookmark-card">
            <Link
              to={`/documents/detail/${bookmark.referenceId}`}
              className="bookmark-link"
            >
              <img
                src={bookmark.document.thumbnail || "/assets/images/default-doc.png"}
                alt={bookmark.document.title}
                className="bookmark-image"
              />
              <h4 className="bookmark-document-title">{bookmark.document.title}</h4>
              <p className="bookmark-stats">
                Lượt tải: {bookmark.document.downloads} | Lượt xem: {bookmark.document.views}
              </p>
            </Link>
            <button
              onClick={() => handleRemoveBookmark(bookmark.referenceId)}
              className="remove-bookmark-button"
            >
              Xóa đánh dấu
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarkList;