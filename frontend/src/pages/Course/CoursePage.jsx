import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getCourses, getCourseById } from "../../services/courseService";
import {
  addBookmark,
  removeBookmark,
  getBookmarks,
} from "../../services/bookmarkService";
import { getEnrolledCourses } from "../../services/userService";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import "./CoursePage.css";

const CoursePage = () => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const response = await getCourses({
          page,
          limit: 6,
          category: category === "all" ? undefined : category,
        });
        setCourses(response.data);
        setFilteredCourses(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError("Không thể tải danh sách khóa học!");
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [page, category]);

  useEffect(() => {
    const loadBookmarksAndEnrollments = async () => {
      if (user && token) {
        try {
          const [bookmarkResponse, enrolledResponse] = await Promise.all([
            getBookmarks(),
            getEnrolledCourses(),
          ]);
          setBookmarks(bookmarkResponse.data.map((b) => b.courseId._id));
          setEnrolledCourses(enrolledResponse.data.map((c) => c._id));
        } catch (err) {
          toast.error(
            "Không thể tải dữ liệu bookmark hoặc khóa học đã đăng ký!"
          );
        }
      }
    };
    loadBookmarksAndEnrollments();
  }, [user, token]);

  const handleSearch = (query, results) => {
    const filtered = results.data?.courses || [];
    setFilteredCourses(filtered);
    setPage(1);
  };

  const handleBookmark = async (courseId) => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để bookmark khóa học!");
      navigate("/auth/login");
      return;
    }
    try {
      if (bookmarks.includes(courseId)) {
        await removeBookmark(courseId);
        setBookmarks(bookmarks.filter((id) => id !== courseId));
        toast.success("Đã xóa bookmark!");
      } else {
        await addBookmark(courseId);
        setBookmarks([...bookmarks, courseId]);
        toast.success("Đã bookmark khóa học!");
      }
    } catch (err) {
      toast.error(err || "Lỗi khi bookmark khóa học!");
    }
  };

  const handleImageError = (e) => {
    e.target.src = "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png";
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="course-page">
      <Helmet>
        <title>FunMath - Khóa học</title>
        <meta
          name="description"
          content="Khám phá các khóa học Toán học từ cơ bản đến nâng cao dành cho mọi cấp độ."
        />
      </Helmet>

      <motion.section
        className="courses-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Các khóa học của chúng tôi</h2>
        <div className="filter-bar">
          <SearchBar onSearch={handleSearch} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-filter"
            aria-label="Lọc theo danh mục"
          >
            <option value="all">Tất cả</option>
            <option value="grade1">Toán cấp 1</option>
            <option value="grade2">Toán cấp 2</option>
            <option value="grade3">Toán cấp 3</option>
            <option value="university">Toán đại học</option>
          </select>
        </div>
        {loading ? (
          <p className="loading">Đang tải...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : filteredCourses.length > 0 ? (
          <div className="courses-list">
            {filteredCourses.map((course) => (
              <motion.div
                key={course._id}
                className="course-item"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={course.thumbnail || "/assets/images/default-course.jpg"}
                  alt={course.title}
                  className="course-image"
                  onError={handleImageError}
                />
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <p className="course-price">
                    Giá: {course.price.toLocaleString()} VND
                  </p>
                  {enrolledCourses.includes(course._id) && (
                    <p className="course-status">Đã đăng ký</p>
                  )}
                  <div className="course-actions">
                    <Link to={`/courses/${course._id}`} className="course-link">
                      {enrolledCourses.includes(course._id)
                        ? "Vào học"
                        : "Xem khóa học"}
                    </Link>
                    {user && (
                      <button
                        className={`bookmark-button ${
                          bookmarks.includes(course._id) ? "bookmarked" : ""
                        }`}
                        onClick={() => handleBookmark(course._id)}
                        aria-label={
                          bookmarks.includes(course._id)
                            ? "Xóa bookmark"
                            : "Bookmark khóa học"
                        }
                      >
                        <i
                          className={
                            bookmarks.includes(course._id)
                              ? "fas fa-bookmark"
                              : "far fa-bookmark"
                          }
                        ></i>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="no-results">Không tìm thấy khóa học nào.</p>
        )}
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="pagination-button"
          >
            Trang trước
          </button>
          <span className="pagination-info">
            Trang {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="pagination-button"
          >
            Trang sau
          </button>
        </div>
      </motion.section>
    </div>
  );
};

export default CoursePage;
