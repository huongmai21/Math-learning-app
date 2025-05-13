import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getDocumentById,
  downloadDocument,
  addBookmark,
  removeBookmark,
  checkBookmark,
} from "../../services/documentService";
import {
  getCommentsByDocument,
  createComment,
  updateComment,
  deleteComment,
} from "../../services/commentService";
import RelatedDocuments from "./RelatedDocuments";
import io from "socket.io-client";
import "./Document.css";

const socket = io("http://localhost:5000");

const DocumentDetail = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [document, setDocument] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [currentPageComments, setCurrentPageComments] = useState(1);
  const commentsPerPage = 5;
  const mathJaxRef = useRef(null);
  const [isMathJaxReady, setIsMathJaxReady] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const doc = await getDocumentById(id);
        setDocument(doc);
        if (user) {
          const { isBookmarked } = await checkBookmark(id);
          setIsBookmarked(isBookmarked);
        }
        const { comments: fetchedComments } = await getCommentsByDocument(id, {
          type: "document",
        });
        setComments(fetchedComments);
      } catch (err) {
        setError("Không thể tải tài liệu!");
      } finally {
        setIsLoading(false);
      }
    };
    loadDocument();

    const checkMathJax = setInterval(() => {
      if (window.MathJax && window.MathJax.typeset) {
        setIsMathJaxReady(true);
        window.MathJax.typeset([mathJaxRef.current]);
        clearInterval(checkMathJax);
      }
    }, 100);

    if (user) {
      socket.emit("join", user._id);
    }

    socket.on("newNotification", (notification) => {
      if (notification.relatedId === id) {
        toast.info(notification.message, { position: "top-right" });
      }
    });

    return () => {
      socket.off("newNotification");
      clearInterval(checkMathJax);
    };
  }, [id, user]);

  const handleDownload = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để tải tài liệu!");
      return;
    }
    try {
      const response = await downloadDocument(id);
      window.open(response.data.fileUrl, "_blank");
      toast.success("Đang tải tài liệu...");
    } catch (err) {
      toast.error("Không thể tải tài liệu!");
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh dấu tài liệu!");
      return;
    }
    try {
      if (isBookmarked) {
        await removeBookmark(id);
        setIsBookmarked(false);
        toast.success("Đã xóa đánh dấu!");
      } else {
        await addBookmark({ referenceId: id, referenceType: "document" });
        setIsBookmarked(true);
        toast.success("Đã đánh dấu tài liệu!");
      }
    } catch (err) {
      toast.error("Không thể cập nhật đánh dấu!");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập để bình luận!");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Nội dung bình luận không được để trống!");
      return;
    }
    try {
      const comment = await createComment({
        referenceId: id,
        referenceType: "document",
        content: newComment,
      });
      setComments([comment, ...comments]);
      setNewComment("");
      toast.success("Đã gửi bình luận!");
    } catch (err) {
      toast.error("Không thể gửi bình luận!");
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (e, commentId) => {
    e.preventDefault();
    if (!editContent.trim()) {
      toast.error("Nội dung bình luận không được để trống!");
      return;
    }
    try {
      const updatedComment = await updateComment(commentId, {
        content: editContent,
      });
      setComments(
        comments.map((c) => (c._id === commentId ? updatedComment : c))
      );
      setEditingComment(null);
      setEditContent("");
      toast.success("Đã cập nhật bình luận!");
    } catch (err) {
      toast.error("Không thể cập nhật bình luận!");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
      toast.success("Đã xóa bình luận!");
    } catch (err) {
      toast.error("Không thể xóa bình luận!");
    }
  };

  const handleCopyContent = () => {
    if (mathJaxRef.current) {
      navigator.clipboard.writeText(document.content);
      toast.success("Đã sao chép nội dung!");
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const indexOfLastComment = currentPageComments * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(
    indexOfFirstComment,
    indexOfLastComment
  );
  const totalPagesComments = Math.ceil(comments.length / commentsPerPage);

  if (isLoading) return <p className="loading-text">Đang tải tài liệu...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!document)
    return <p className="error-message">Không tìm thấy tài liệu!</p>;
  if (!isMathJaxReady)
    return <p className="loading-text">Đang tải MathJax...</p>;

  return (
    <div className="container">
      <div className="doc-detail">
        <h2 className="doc-title">{document.title}</h2>
        <div className="doc-meta">
          <div>
            <p>Đăng bởi: {document.uploadedBy.username}</p>
            <p>
              Ngày đăng: {new Date(document.uploadedAt).toLocaleDateString()}
            </p>
            <p>
              Lượt xem: {document.views} | Lượt tải: {document.downloads}
            </p>
          </div>
          <div className="doc-actions">
            <button onClick={togglePreview} className="preview-button">
              {showPreview ? "Ẩn xem trước" : "Xem trước"}
            </button>
            <button onClick={handleDownload} className="download-button">
              Tải tài liệu
            </button>
            <button onClick={handleBookmark} className="bookmark-button">
              {isBookmarked ? "Xóa đánh dấu" : "Đánh dấu"}
            </button>
          </div>
        </div>
        {showPreview && document.fileUrl && (
          <div className="pdf-preview">
            <iframe
              src={document.fileUrl}
              title="PDF Preview"
              className="pdf-iframe"
              loading="lazy"
              frameBorder="0"
            ></iframe>
          </div>
        )}
        <div className="doc-content">
          <div
            ref={mathJaxRef}
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
          <button
            onClick={handleCopyContent}
            className="comment-submit"
            style={{ marginTop: "10px" }}
          >
            Sao chép nội dung
          </button>
        </div>
        {document.thumbnail && (
          <img
            src={document.thumbnail}
            alt={document.title}
            className="doc-thumbnail"
          />
        )}
        <div className="doc-tags">
          <p className="tags-label">Thẻ:</p>
          <p>{document.tags?.join(", ")}</p>
        </div>
        <Link to="/documents" className="back-link">
          Quay lại danh sách
        </Link>
        <div className="comments-section">
          <h3 className="comments-title">Bình luận</h3>
          {user ? (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="comment-input"
                placeholder="Viết bình luận của bạn..."
              />
              <button type="submit" className="comment-submit">
                Gửi
              </button>
            </form>
          ) : (
            <p className="comment-login-prompt">
              Vui lòng{" "}
              <Link to="/auth/login" className="login-link">
                đăng nhập
              </Link>{" "}
              để bình luận.
            </p>
          )}
          <div className="comments-list">
            {currentComments.length > 0 ? (
              currentComments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <p className="comment-author">{comment.author.username}</p>
                  {editingComment === comment._id ? (
                    <form
                      onSubmit={(e) => handleUpdateComment(e, comment._id)}
                      className="comment-edit-form"
                    >
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="comment-input"
                      />
                      <div className="comment-edit-actions">
                        <button type="submit" className="comment-submit">
                          Lưu
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingComment(null)}
                          className="comment-cancel"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="comment-content">{comment.content}</p>
                      <p className="comment-date">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                      {(user?._id === comment.author._id ||
                        user?.role === "admin") && (
                        <div className="comment-actions">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="comment-edit-button"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="comment-delete-button"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              <p className="no-comments">Chưa có bình luận nào.</p>
            )}
          </div>
          {totalPagesComments > 1 && (
            <div className="pagination">
              <button
                onClick={() =>
                  setCurrentPageComments((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentPageComments === 1}
                className="pagination-button"
              >
                Trước
              </button>
              {[...Array(totalPagesComments)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPageComments(i + 1)}
                  className={`pagination-button ${
                    currentPageComments === i + 1 ? "active" : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPageComments((prev) =>
                    Math.min(prev + 1, totalPagesComments)
                  )
                }
                disabled={currentPageComments === totalPagesComments}
                className="pagination-button"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
      <RelatedDocuments currentDoc={document} />
    </div>
  );
};

export default DocumentDetail;
