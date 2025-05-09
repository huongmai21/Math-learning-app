// src/pages/HomePage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import SearchBar from "../../components/common/Search/SearchBar"; // Import SearchBar
import Footer  from "../../components/layout/Footer/Footer";
import "./HomePage.css";

const HomePage = () => {
  const [news, setNews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Kết nối Socket.io
  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("examNotification", (data) => {
      toast.info(data.message, {
        position: "top-right",
        autoClose: 3000,
      });
    });

    socket.on("messageNotification", (data) => {
      toast.info(data.message, {
        position: "top-right",
        autoClose: 3000,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Lấy thông tin người dùng
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Invalid token");
          return res.json();
        })
        .then((data) => setUser(data))
        .catch((err) => {
          console.error(err);
          localStorage.removeItem("token");
        });
    }
  }, []);

  // Lấy dữ liệu tin tức và khóa học
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("http://localhost:3000/news?limit=3").then((res) => res.json()),
      fetch("http://localhost:3000/courses?limit=3").then((res) => res.json()),
    ])
      .then(([newsData, coursesData]) => {
        setNews(newsData);
        setCourses(coursesData);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải dữ liệu");
        setLoading(false);
      });
  }, []);

  // Hiệu ứng cho các section
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // Xử lý lỗi hình ảnh
  const handleImageError = (e) => {
    e.target.src = "/assets/images/placeholder.jpg";
  };

  return (
    <div className="homepage">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>FunMath - Học Toán Dễ Dàng và Thú Vị</title>
        <meta
          name="description"
          content="FunMath cung cấp tài liệu học tập, khóa học, tin tức giáo dục, và các hoạt động thi đấu Toán học cho học sinh, sinh viên và giáo viên."
        />
        <meta
          name="keywords"
          content="học toán, tài liệu toán, khóa học toán, tin tức giáo dục, thi đấu toán học"
        />
        <meta name="author" content="FunMath Team" />
      </Helmet>

      {/* Thanh tìm kiếm */}
      <SearchBar />

      {/* Banner */}
      <motion.section
        className="banner"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="banner-content">
          <h1>Chào mừng đến với FunMath</h1>
          <p>Học Toán dễ dàng và thú vị hơn bao giờ hết!</p>
          <button
            className="cta-button"
            onClick={() => navigate(user ? "/courses" : "/auth/login")}
          >
            {user ? "Bắt đầu học ngay" : "Đăng nhập để học ngay"}
          </button>
        </div>
      </motion.section>

      {/* Tin tức nổi bật */}
      <motion.section
        className="news-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Tin tức nổi bật</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : news.length > 0 ? (
          <div className="news-list">
            {news.map((item) => (
              <motion.div
                key={item.id}
                className="news-item"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={item.image || "/assets/images/default-news.jpg"}
                  alt={item.title}
                  className="news-image"
                  onError={handleImageError}
                />
                <div className="news-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <Link to={`/news/${item.id}`}>Đọc thêm</Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p>Không có tin tức nào.</p>
        )}
        <Link to="/news" className="view-more">
          Xem tất cả tin tức
        </Link>
      </motion.section>

      {/* Tài liệu học tập */}
      <motion.section
        className="resources-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Tài liệu học tập</h2>
        <div className="resources-list">
          {[
            { to: "/documents/grade1", label: "Cấp 1" },
            { to: "/documents/grade2", label: "Cấp 2" },
            { to: "/documents/grade3", label: "Cấp 3" },
            { to: "/documents/university", label: "Đại học" },
          ].map((item, index) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link to={item.to} className="resource-item">
                <i className={item.label.includes("Sách") ? "fas fa-book-open" : "fas fa-book"}></i>
                <span>{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Khóa học nổi bật */}
      <motion.section
        className="courses-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Khóa học nổi bật</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : courses.length > 0 ? (
          <div className="courses-list">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                className="course-item"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={course.image || "/assets/images/default-course.jpg"}
                  alt={course.title}
                  className="course-image"
                  onError={handleImageError}
                />
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <Link to={`/courses/${course.id}`}>Xem khóa học</Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p>Không có khóa học nào.</p>
        )}
        <Link to="/courses" className="view-more">
          Xem tất cả khóa học
        </Link>
      </motion.section>

      {/* Thi đấu và hoạt động */}
      <motion.section
        className="activities-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Thi đấu và học tập</h2>
        <div className="activities-list">
          <motion.div
            className="activity-item"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <h3>Tham gia thi đấu</h3>
            <p>Kiểm tra kiến thức của bạn với các đề thi thú vị!</p>
            <Link to="/exam" className="activity-button">
              Thi đấu ngay
            </Link>
          </motion.div>
          {user ? (
            <>
              <motion.div
                className="activity-item"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <h3>Góc học tập</h3>
                <p>Hỏi bài và giải bài tập cùng cộng đồng.</p>
                <Link to="/study-corner" className="activity-button">
                  Truy cập ngay
                </Link>
              </motion.div>
              <motion.div
                className="activity-item"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {/* <h3>Góc chia sẻ</h3>
                <p>Thảo luận và chia sẻ kiến thức Toán học.</p>
                <Link to="/share-corner" className="activity-button">
                  Tham gia ngay
                </Link>
              </motion.div>
              <motion.div
                className="activity-item"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.3 }}
              > */}
                <h3>Phòng học nhóm</h3>
                <p>Cùng học và trao đổi với bạn bè.</p>
                <Link to="/study-room" className="activity-button">
                  Tạo phòng ngay
                </Link>
              </motion.div>
            </>
          ) : (
            <motion.div
              className="activity-item"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
            >
              <h3>Tham gia cộng đồng</h3>
              <p>Đăng nhập để truy cập các góc học tập, chia sẻ và phòng học nhóm.</p>
              <button
                onClick={() => navigate("/auth/login")}
                className="activity-button"
              >
                Đăng nhập ngay
              </button>
            </motion.div>
          )}
        </div>
      </motion.section>
      <Footer/>
    </div>
  );
};

export default HomePage;