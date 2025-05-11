import React, { useState } from "react";
import { toast } from "react-toastify";
import "./SearchBar.css";

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Vui lòng nhập từ khóa tìm kiếm!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error("Tìm kiếm thất bại!");
      }
      const data = await response.json();
      toast.success("Tìm kiếm thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
      if (onSearch) {
        onSearch(searchQuery, data);
      }
    } catch (err) {
      toast.error(err.message || "Đã có lỗi xảy ra khi tìm kiếm!", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-bar">
      <input
        type="text"
        placeholder="Tìm kiếm tài liệu, khóa học, tin tức..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
        disabled={loading}
      />
      <button
        type="submit"
        className="search-button"
        disabled={loading}
      >
        <i className="fas fa-search"></i>
      </button>
    </form>
  );
};

export default SearchBar;