import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { fetchNews, fetchNewsById } from "../../services/newsService"; // Cập nhật import
import Navbar from "../../components/layout/Navbar/Navbar";
import SearchBar from "../../components/common/SearchBar/SearchBar";

import "./News.css";

const NewsMagazine = () => {
  const [newsData, setNewsData] = useState({ news: [], total: 0, totalPages: 0, currentPage: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNews, setSelectedNews] = useState(null);
  const category = "math-magazine";

  useEffect(() => {
    fetchNews(1, searchQuery, category).then((result) => setNewsData(result));
  }, [searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePageChange = (event) => {
    const newPage = event.selected + 1;
    fetchNews(newPage, searchQuery, category).then((result) => setNewsData(result));
  };

  const handleNewsClick = async (id) => {
    const result = await fetchNewsById(id);
    if (result.success) {
      setSelectedNews(result.news);
    }
  };

  const closeNewsDetail = () => {
    setSelectedNews(null);
  };

  return (
    <div>
      <Navbar />
      <div className="news-container">
        <h1>Tạp chí toán</h1>
        <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm tạp chí toán..." />
        
        {selectedNews && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{selectedNews.title}</h2>
              <div className="news-meta">
                <span>Đăng bởi: {selectedNews.author?.fullName || selectedNews.author?.username}</span> | 
                <span> Ngày đăng: {new Date(selectedNews.publishedAt).toLocaleDateString()}</span> | 
                <span> Lượt xem: {selectedNews.views}</span>
              </div>
              {selectedNews.image && (
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  className="modal-image"
                />
              )}
              <p>{selectedNews.content}</p>
              {selectedNews.tags && selectedNews.tags.length > 0 && (
                <div className="news-tags">
                  Tags: {selectedNews.tags.join(", ")}
                </div>
              )}
              <button onClick={closeNewsDetail} className="modal-close-btn">
                Đóng
              </button>
            </div>
          </div>
        )}

        <div className="news-list">
          {newsData.news.length > 0 ? (
            newsData.news.map((item) => (
              <div
                key={item._id}
                onClick={() => handleNewsClick(item._id)}
                className="news-item"
              >
                {item.thumbnail && (
                  <img src={item.thumbnail} alt={item.title} className="news-image" />
                )}
                <div className="news-content">
                  <h2>{item.title}</h2>
                  <div className="news-meta">
                    <span>Đăng bởi: {item.author?.fullName || item.author?.username}</span> | 
                    <span> Ngày đăng: {new Date(item.publishedAt).toLocaleDateString()}</span> | 
                    <span> Lượt xem: {item.views}</span>
                  </div>
                  <p>{item.summary || item.content.slice(0, 150) + "..."}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="news-tags">
                      Tags: {item.tags.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-news">Không có bài viết nào.</p>
          )}
        </div>

        {newsData.totalPages > 1 && (
          <div className="pagination">
            <ReactPaginate
              breakLabel="..."
              nextLabel="Tiếp >"
              onPageChange={handlePageChange}
              pageRangeDisplayed={5}
              pageCount={newsData.totalPages}
              previousLabel="< Trước"
              renderOnZeroPageCount={null}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsMagazine;