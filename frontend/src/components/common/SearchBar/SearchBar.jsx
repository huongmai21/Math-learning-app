"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
// Sử dụng FontAwesome thay vì react-icons
import searchService from "../../../services/searchService"
import "./SearchBar.css"

const SearchBar = ({ placeholder = "Tìm kiếm...", onSearch, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 2) {
        setLoading(true)
        try {
          const results = await searchService.searchResources(searchTerm)
          setSearchResults(results)
          setShowResults(true)
        } catch (error) {
          console.error("Error searching:", error)
          setSearchResults([])
        } finally {
          setLoading(false)
        }
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm])

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim().length > 0) {
      if (onSearch) {
        onSearch(searchTerm)
      } else {
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
      }
      setShowResults(false)
    }
  }

  const handleResultClick = (result) => {
    let url = ""
    switch (result.type) {
      case "course":
        url = `/courses/${result._id}`
        break
      case "document":
        url = `/documents/${result._id}`
        break
      case "news":
        url = `/news/${result._id}`
        break
      case "exam":
        url = `/exams/${result._id}`
        break
      case "user":
        url = `/users/${result._id}`
        break
      default:
        url = `/search?q=${encodeURIComponent(searchTerm)}`
    }
    navigate(url)
    setShowResults(false)
    setSearchTerm("")
  }

  return (
    <div className={`search-container ${className}`} ref={searchRef}>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.trim().length > 2 && setShowResults(true)}
        />
        <button type="submit" className="search-icon" aria-label="Tìm kiếm">
          <i className="fas fa-search"></i>
        </button>
      </form>

      {showResults && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">Đang tìm kiếm...</div>
          ) : searchResults.length > 0 ? (
            searchResults.map((result) => (
              <div
                key={`${result.type}-${result._id}`}
                className="search-result-item"
                onClick={() => handleResultClick(result)}
              >
                <div className="search-result-title">{result.title}</div>
                {result.description && (
                  <div className="search-result-description">
                    {result.description.length > 100
                      ? `${result.description.substring(0, 100)}...`
                      : result.description}
                  </div>
                )}
                <div className="search-result-type">
                  {result.type === "course"
                    ? "Khóa học"
                    : result.type === "document"
                      ? "Tài liệu"
                      : result.type === "news"
                        ? "Tin tức"
                        : result.type === "exam"
                          ? "Đề thi"
                          : result.type === "user"
                            ? "Người dùng"
                            : result.type}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">Không tìm thấy kết quả</div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
