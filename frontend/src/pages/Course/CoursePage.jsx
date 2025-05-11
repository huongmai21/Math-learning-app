// frontend/src/pages/CoursePage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { fetchCourses } from "../services/api";
import "./CoursePage.css";

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const response = await fetchCourses({ page, limit: 6, filter });
        setCourses(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [page, filter]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleImageError = (e) => {
    e.target.src = "/assets/images/default-course.jpg";
  };

  return (
    <div className="course-page">
      <Helmet>
        <title>FunMath - Our Courses</title>
        <meta
          name="description"
          content="Explore our wide range of math courses for all levels, from beginner to advanced."
        />
      </Helmet>

      <motion.section
        className="courses-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Our Courses</h2>
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search courses..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : courses.length > 0 ? (
          <div className="courses-list">
            {courses.map((course) => (
              <motion.div
                key={course._id}
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
                  <Link to={`/courses/${course._id}`}>View Course</Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p>No courses found.</p>
        )}
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </motion.section>
    </div>
  );
};

export default CoursePage;