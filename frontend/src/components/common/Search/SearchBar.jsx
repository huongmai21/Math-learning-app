import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center max-w-lg w-full mx-auto mt-6 bg-white rounded-full shadow-md p-2"
    >
      <input
        type="text"
        placeholder="Tìm kiếm tài liệu, khóa học, tin tức..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 bg-transparent p-2 text-[#2c3e50] outline-none"
      />
      <button type="submit" className="text-[#ff6f61] p-2 hover:text-[#ff9a8b]">
        <i className="fas fa-search text-lg"></i>
      </button>
    </form>
  );
};

export default SearchBar;
