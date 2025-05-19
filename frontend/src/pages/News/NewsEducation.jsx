import React, { useState, useEffect, useRef, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import io from "socket.io-client";
import { Tooltip } from "react-tooltip";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { getNews, getNewsById } from "../../services/newsService";
import { addBookmark, removeBookmark, checkBookmarks } from "../../services/bookmarkService";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import "./News.css";

const NewsEducation = () => {
  const { user } = useSelector((state) => state.auth);
  const [newsData, setNewsData] = useState({ news: [], total: 0, totalPages: 0, currentPage: 1 });
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [bookmarkedNewsIds, setBookmarkedNewsIds] = useState([]);
  const [bookmarkLoading, setBookmarkLoading] = useState({});
  const socketRef = useRef(null);
  const category = "education";

  // Khởi tạo WebSocket
  useEffect(() => {
    if (user) {
      socketRef.current = io("http://localhost:5000", {
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        console.log("Connected to WebSocket");
        socketRef.current.emit("join", user._id);
      });

      socketRef.current.on("bookmark_notification", ({ message }) => {
        toast.info(message);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [user]);

  // Kiểm tra trạng thái bookmark
  const loadBookmarkedNewsIds = async (newsItems) => {
    if (!user || !newsItems || newsItems.length === 0) return;

    try {
      const newsIds = newsItems.map((item) => item._id);
      const response = await checkBookmarks("news", newsIds);
      setBookmarkedNewsIds(response.data || []);
    } catch (error) {
      console.error("Error checking bookmarks:", error);
    }
  };

  // Tải danh sách tin tức
  useEffect(() => {
    const loadNews = async () => {
      const result = await getNews(1, searchQuery, category);
      setNewsData(result);
      await loadBookmarkedNewsIds(result.news);
    };
    loadNews();
  }, [searchQuery]);

  // Tìm kiếm gợi ý
  useEffect(() => {
    const loadSuggestions = async () => {
      if (searchQuery.trim()) {
        const response = await getNewsById().getNewsSuggestions(searchQuery); // Giả định endpoint
        setSuggestions(response.data || []);
      } else {
        setSuggestions([]);
      }
    };
    loadSuggestions();
  }, [searchQuery]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePageChange = (event) => {
    const newPage = event.selected + 1;
    getNews(newPage, searchQuery, category).then((result) => {
      setNewsData(result);
      loadBookmarkedNewsIds(result.news);
    });
  };

  const handleNewsClick = async (id) => {
    const result = await getNewsById(id);
    if (result.success) {
      setSelectedNews(result.news);
    }
  };

  const closeNewsDetail = () => {
    setSelectedNews(null);
  };

  const handleBookmarkNews = async (newsId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh dấu tin tức");
      return;
    }

    setBookmarkLoading((prev) => ({ ...prev, [newsId]: true }));

    try {
      const isBookmarked = bookmarkedNewsIds.includes(newsId);

      if (isBookmarked) {
        await removeBookmark("news", newsId);
        setBookmarkedNewsIds(bookmarkedNewsIds.filter((id) => id !== newsId));
        socketRef.current.emit("bookmark", {
          userId: user._id,
          referenceType: "news",
          referenceId: newsId,
          action: "remove",
        });
      } else {
        await addBookmark("news", newsId);
        setBookmarkedNewsIds([...bookmarkedNewsIds, newsId]);
        socketRef.current.emit("bookmark", {
          userId: user._id,
          referenceType: "news",
          referenceId: newsId,
          action: "add",
        });
      }
    } catch (error) {
      toast.error(error.message || "Không thể đánh dấu tin tức");
    } finally {
      setBookmarkLoading((prev) => ({ ...prev, [newsId]: false }));
    }
  };

  const NewsRow = ({ index, style }) => {
    const item = newsData.news[index];
    const isBookmarked = bookmarkedNewsIds.includes(item._id);

    return (
      <div style={style} className="news-item">
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
          {user && (
            <button
              className={`action-button ${isBookmarked ? "bookmarked" : ""}`}
              onClick={() => handleBookmarkNews(item._id)}
              disabled={bookmarkLoading[item._id]}
              data-tooltip-id={`tooltip-bookmark-news-${item._id}`}
              data-tooltip-content={isBookmarked ? "Bỏ lưu" : "Lưu tin tức"}
            >
              {bookmarkLoading[item._id] ? (
                <div className="spinner" style={{ width: "16px", height: "16px" }}></div>
              ) : (
                <i className="fas fa-bookmark"></i>
              )}
            </button>
          )}
          <Tooltip id={`tooltip-bookmark-news-${item._id}`} />
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="news-container">
        <h1>Thông tin giáo dục</h1>
        <SearchBar
          onSearch={handleSearch}
          placeholder="Tìm kiếm thông tin giáo dục..."
          suggestions={suggestions}
        />
        
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

        <div className="news-list" style={{ height: "600px" }}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                itemCount={newsData.news.length}
                itemSize={300}
              >
                {NewsRow}
              </List>
            )}
          </AutoSizer>
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

export default NewsEducation;