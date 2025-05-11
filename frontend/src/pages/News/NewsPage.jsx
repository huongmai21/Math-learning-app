// frontend/src/pages/NewsPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { fetchNews } from "../services/api";
import "./NewsPage.css";

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState("education");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const response = await fetchNews({ page, limit: 5, category, search });
        setNews(response.data);
        setTotalPages(response.totalPages);
      } catch (err) {
        setError("Failed to load news");
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, [page, category, search]);

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleImageError = (e) => {
    e.target.src = "/assets/images/default-news.jpg";
  };

  return (
    <div className="news-page">
      <Helmet>
        <title>FunMath - News</title>
        <meta
          name="description"
          content="Stay updated with the latest educational news and math-related articles."
        />
      </Helmet>

      <motion.section
        className="news-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <h2>Latest News</h2>
        <div className="filter-bar">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="education">Education</option>
            <option value="math">Math</option>
            <option value="science">Science</option>
          </select>
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : news.length > 0 ? (
          <div className="news-list">
            {news.map((item) => (
              <motion.div
                key={item._id}
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
                  <p>{item.summary}</p>
                  <Link to={`/news/${item._id}`}>Read More</Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p>No news found.</p>
        )}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
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

export default NewsPage;
