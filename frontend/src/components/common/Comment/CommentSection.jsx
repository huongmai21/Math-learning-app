import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../../../services/commentService";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import "./Comment.css";

const CommentSection = ({ referenceId, referenceType }) => {
  const { user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 5;

  const loadComments = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      const data = await getComments(referenceId, referenceType, {
        page: pageToLoad,
        limit: itemsPerPage,
      });
      setComments(data.data);
      setTotal(data.total);
      setPage(pageToLoad);
    } catch (err) {
      toast.error("Lỗi khi tải bình luận: " + (err.message || "Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceId, referenceType]);

  const handlePost = async () => {
    if (!newComment.trim()) {
      toast.error("Bình luận không được để trống!");
      return;
    }
    try {
      setLoading(true);
      await createComment(referenceId, referenceType, newComment);
      setNewComment("");
      toast.success("Đăng bình luận thành công!");
      loadComments(1);
    } catch (err) {
      toast.error("Bạn cần đăng nhập để bình luận.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá bình luận này?")) return;
    try {
      setLoading(true);
      await deleteComment(id);
      toast.success("Xoá bình luận thành công!");
      loadComments(page);
    } catch (err) {
      toast.error("Không thể xoá bình luận: " + (err.message || "Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editingContent.trim()) {
      toast.error("Bình luận không được để trống!");
      return;
    }
    try {
      setLoading(true);
      await updateComment(id, editingContent);
      setEditingId(null);
      setEditingContent("");
      toast.success("Sửa bình luận thành công!");
      loadComments(page);
    } catch (err) {
      toast.error("Không thể sửa bình luận: " + (err.message || "Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  };

  const isAuthorOrAdmin = (comment) =>
    user && (comment.author._id === user._id || user.role === "admin");

  return (
    <div className="comment-section">
      <h3>Bình luận</h3>

      {loading && <p>Đang tải...</p>}

      {user ? (
        <div className="comment-input">
          <textarea
            placeholder="Viết bình luận..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
          />
          <button onClick={handlePost} disabled={loading}>
            Gửi
          </button>
        </div>
      ) : (
        <p>
          Hãy <a href="/auth/login">đăng nhập</a> để bình luận.
        </p>
      )}

      <ul className="comment-list">
        {comments.length > 0 ? (
          comments.map((c) => (
            <li key={c._id} className="comment-item">
              <strong>{c.author?.username || "Ẩn danh"}:</strong>{" "}
              {editingId === c._id ? (
                <>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    disabled={loading}
                  />
                  <button onClick={() => handleEdit(c._id)} disabled={loading}>
                    Lưu
                  </button>
                  <button onClick={() => setEditingId(null)} disabled={loading}>
                    Huỷ
                  </button>
                </>
              ) : (
                <>
                  <span>{c.content}</span>
                  {isAuthorOrAdmin(c) && (
                    <div className="comment-actions">
                      <button
                        onClick={() => {
                          setEditingId(c._id);
                          setEditingContent(c.content);
                        }}
                        disabled={loading}
                      >
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(c._id)} disabled={loading}>
                        🗑️
                      </button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))
        ) : (
          <p>Chưa có bình luận nào.</p>
        )}
      </ul>

      {total > itemsPerPage && (
        <ReactPaginate
          breakLabel="..."
          nextLabel="Tiếp >"
          onPageChange={(event) => loadComments(event.selected + 1)}
          pageRangeDisplayed={5}
          pageCount={Math.ceil(total / itemsPerPage)}
          previousLabel="< Trước"
          renderOnZeroPageCount={null}
          containerClassName="pagination"
          activeClassName="active"
        />
      )}
    </div>
  );
};

export default CommentSection;