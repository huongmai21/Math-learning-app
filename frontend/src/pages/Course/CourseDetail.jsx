import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import {
  getCourseById,
  enrollCourse,
  addCourseContent,
  updateCourseContent,
  deleteCourseContent,
  updateProgress,
  getProgress,
  createReview,
  getReviews,
} from "../../services/courseService";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
} from "../../services/bookmarkService";
import "./CourseDetail.css";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({ completedContents: [] });
  const [reviews, setReviews] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [newContent, setNewContent] = useState({
    title: "",
    type: "video",
    url: "",
    isPreview: false,
  });
  const [editingContent, setEditingContent] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getCourseById(id);
        setCourse(response.data);
        if (user && token) {
          const progressRes = await getProgress(id);
          setProgress(progressRes.data);
          const reviewsRes = await getReviews(id);
          setReviews(reviewsRes.data);
          const bookmarkRes = await getBookmarks();
          setBookmarks(bookmarkRes.data.map((b) => b.courseId._id));
        }
      } catch (err) {
        setError(err || "Không thể tải chi tiết khóa học!");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, user, token]);

  const handleEnroll = async () => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để đăng ký khóa học!");
      navigate("/auth/login");
      return;
    }
    try {
      await enrollCourse(id);
      toast.success("Đăng ký khóa học thành công!");
      navigate(0);
    } catch (err) {
      toast.error(err || "Đăng ký thất bại!");
    }
  };

  const handleBookmark = async () => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để bookmark khóa học!");
      navigate("/auth/login");
      return;
    }
    try {
      if (bookmarks.includes(id)) {
        await removeBookmark(id);
        setBookmarks(bookmarks.filter((bId) => bId !== id));
        toast.success("Đã xóa bookmark!");
      } else {
        await addBookmark(id);
        setBookmarks([...bookmarks, id]);
        toast.success("Đã bookmark khóa học!");
      }
    } catch (err) {
      toast.error(err || "Lỗi khi bookmark khóa học!");
    }
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      const response = await addCourseContent(id, newContent);
      setCourse(response.data);
      setNewContent({ title: "", type: "video", url: "", isPreview: false });
      toast.success("Thêm nội dung thành công!");
    } catch (err) {
      toast.error(err || "Thêm nội dung thất bại!");
    }
  };

  const handleUpdateContent = async (e) => {
    e.preventDefault();
    try {
      const response = await updateCourseContent(
        id,
        editingContent._id,
        newContent
      );
      setCourse(response.data);
      setEditingContent(null);
      setNewContent({ title: "", type: "video", url: "", isPreview: false });
      toast.success("Cập nhật nội dung thành công!");
    } catch (err) {
      toast.error(err || "Cập nhật nội dung thất bại!");
    }
  };

  const handleDeleteContent = async (contentId) => {
    try {
      const response = await deleteCourseContent(id, contentId);
      setCourse(response.data);
      toast.success("Xóa nội dung thành công!");
    } catch (err) {
      toast.error(err || "Xóa nội dung thất bại!");
    }
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setNewContent({
      title: content.title,
      type: content.type,
      url: content.url,
      isPreview: content.isPreview,
    });
  };

  const handleMarkComplete = async (contentId, completed) => {
    try {
      const response = await updateProgress(id, contentId, completed);
      setProgress(response.data);
      toast.success(
        completed ? "Đánh dấu hoàn thành!" : "Bỏ đánh dấu hoàn thành!"
      );
      if (response.data.completedContents.length === course.contents.length) {
        toast.success("Chúc mừng! Bạn đã hoàn thành khóa học!");
      }
    } catch (err) {
      toast.error(err || "Cập nhật tiến độ thất bại!");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await createReview(id, newReview);
      setReviews([...reviews, response.data]);
      setNewReview({ rating: 5, comment: "" });
      toast.success("Gửi đánh giá thành công!");
    } catch (err) {
      toast.error(err || "Gửi đánh giá thất bại!");
    }
  };

  const handleImageError = (e) => {
    e.target.src = "/assets/images/default-course.jpg";
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!course) {
    return <div className="no-results">Khóa học không tồn tại.</div>;
  }

  return (
    <div className="course-detail">
      <Helmet>
        <title>FunMath - {course.title}</title>
        <meta name="description" content={course.description} />
      </Helmet>
      <div className="course-container">
        <Link to="/courses" className="back-link">
          <i className="fas fa-arrow-left"></i> Quay lại danh sách khóa học
        </Link>
        <div className="course-header">
          <img
            src={course.thumbnail || "/assets/images/default-course.jpg"}
            alt={course.title}
            className="course-thumbnail"
            onError={handleImageError}
          />
          <div className="course-info">
            <h2>{course.title}</h2>
            <p className="course-description">{course.description}</p>
            <p className="course-price">
              Giá: {course.price.toLocaleString()} VND
            </p>
            <p className="course-instructor">
              Giảng viên: {course.instructorId?.username || "N/A"}
            </p>
            {user && (
              <button
                className={`bookmark-button ${
                  bookmarks.includes(id) ? "bookmarked" : ""
                }`}
                onClick={handleBookmark}
                aria-label={
                  bookmarks.includes(id) ? "Xóa bookmark" : "Bookmark khóa học"
                }
              >
                <i
                  className={
                    bookmarks.includes(id)
                      ? "fas fa-bookmark"
                      : "far fa-bookmark"
                  }
                ></i>
                {bookmarks.includes(id) ? " Đã bookmark" : " Bookmark"}
              </button>
            )}
          </div>
        </div>
        {user?.role === "student" && !user.enrolledCourses.includes(id) && (
          <div className="enroll-section">
            {course.price > 0 ? (
              <Link to={`/payment/${id}`} className="enroll-button">
                Thanh toán để đăng ký
              </Link>
            ) : (
              <button onClick={handleEnroll} className="enroll-button">
                Đăng ký miễn phí
              </button>
            )}
          </div>
        )}
        {(user?.role === "teacher" || user?.role === "admin") && (
          <div className="content-form-section">
            <h3>{editingContent ? "Chỉnh sửa nội dung" : "Thêm nội dung"}</h3>
            <form
              onSubmit={editingContent ? handleUpdateContent : handleAddContent}
              className="content-form"
            >
              <div className="form-group">
                <label>Tiêu đề</label>
                <input
                  type="text"
                  value={newContent.title}
                  onChange={(e) =>
                    setNewContent({ ...newContent, title: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Loại</label>
                <select
                  value={newContent.type}
                  onChange={(e) =>
                    setNewContent({ ...newContent, type: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="video">Video</option>
                  <option value="document">Tài liệu</option>
                  <option value="quiz">Bài kiểm tra</option>
                </select>
              </div>
              <div className="form-group">
                <label>URL</label>
                <input
                  type="url"
                  value={newContent.url}
                  onChange={(e) =>
                    setNewContent({ ...newContent, url: e.target.value })
                  }
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newContent.isPreview}
                    onChange={(e) =>
                      setNewContent({
                        ...newContent,
                        isPreview: e.target.checked,
                      })
                    }
                  />
                  Cho phép xem trước
                </label>
              </div>
              <button type="submit" className="form-button">
                {editingContent ? "Cập nhật nội dung" : "Thêm nội dung"}
              </button>
              {editingContent && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingContent(null);
                    setNewContent({
                      title: "",
                      type: "video",
                      url: "",
                      isPreview: false,
                    });
                  }}
                  className="cancel-button"
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </form>
          </div>
        )}
        <div className="contents-section">
          <h3>Nội dung khóa học</h3>
          {course.contents?.length > 0 ? (
            <ul className="contents-list">
              {course.contents.map((content) => (
                <li key={content._id} className="content-item">
                  <div className="content-info">
                    {user?.enrolledCourses.includes(id) || content.isPreview ? (
                      <a
                        href={content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="content-link"
                      >
                        {content.title} (
                        {content.type === "video"
                          ? "Video"
                          : content.type === "document"
                          ? "Tài liệu"
                          : "Bài kiểm tra"}
                        )
                        {content.isPreview && (
                          <span className="preview-tag">(Xem trước)</span>
                        )}
                      </a>
                    ) : (
                      <span className="content-locked">
                        {content.title} (
                        {content.type === "video"
                          ? "Video"
                          : content.type === "document"
                          ? "Tài liệu"
                          : "Bài kiểm tra"}
                        ) - Đăng ký để xem
                      </span>
                    )}
                    {user?.enrolledCourses.includes(id) && (
                      <button
                        onClick={() =>
                          handleMarkComplete(
                            content._id,
                            !progress.completedContents.includes(content._id)
                          )
                        }
                        className={`complete-button ${
                          progress.completedContents.includes(content._id)
                            ? "completed"
                            : ""
                        }`}
                      >
                        {progress.completedContents.includes(content._id)
                          ? "Đã hoàn thành"
                          : "Đánh dấu hoàn thành"}
                      </button>
                    )}
                  </div>
                  {(user?.role === "teacher" || user?.role === "admin") && (
                    <div className="content-actions">
                      <button
                        onClick={() => handleEditContent(content)}
                        className="edit-button"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content._id)}
                        className="delete-button"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-results">Chưa có nội dung nào.</p>
          )}
        </div>
        {user?.enrolledCourses.includes(id) && (
          <div className="progress-section">
            <h3>Tiến độ học</h3>
            <p>
              Hoàn thành: {progress.completedContents.length} /{" "}
              {course.contents.length} nội dung (
              {(
                (progress.completedContents.length / course.contents.length) *
                100
              ).toFixed(2)}
              %)
            </p>
            {user.completedCourses.includes(id) && (
              <p className="completed-message">
                Bạn đã hoàn thành khóa học này!
              </p>
            )}
          </div>
        )}
        <div className="reviews-section">
          <h3>Đánh giá khóa học</h3>
          {user?.enrolledCourses.includes(id) && (
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="form-group">
                <label>Số sao</label>
                <select
                  value={newReview.rating}
                  onChange={(e) =>
                    setNewReview({
                      ...newReview,
                      rating: Number(e.target.value),
                    })
                  }
                  className="form-select"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>
                      {star} sao
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Bình luận</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  className="form-textarea"
                />
              </div>
              <button type="submit" className="form-button">
                Gửi đánh giá
              </button>
            </form>
          )}
          <div className="reviews-list">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <p className="review-header">
                    {review.userId?.username || "Ẩn danh"} - {review.rating} sao
                  </p>
                  <p className="review-comment">{review.comment}</p>
                  <p className="review-date">
                    {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              ))
            ) : (
              <p className="no-results">Chưa có đánh giá nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
