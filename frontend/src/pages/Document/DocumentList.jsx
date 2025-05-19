"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useLocation, Link } from "react-router-dom"
import { Helmet } from "react-helmet"
import { motion } from "framer-motion"
import SearchBar from "../../components/common/SearchBar/SearchBar"
import { getDocuments, getPopularDocuments, searchDocuments } from "../../services/documentService"
import { debounce } from "lodash"
import ReactPaginate from "react-paginate"
import "./Document.css"

const educationLevelMap = {
  grade1: { value: "primary", label: "Tiểu học" },
  grade2: { value: "secondary", label: "Trung học cơ sở" },
  grade3: { value: "highschool", label: "Trung học phổ thông" },
  university: { value: "university", label: "Đại học" },
}

const gradeMap = {
  primary: ["1", "2", "3", "4", "5"],
  secondary: ["6", "7", "8", "9"],
  highschool: ["10", "11", "12"],
}

const universitySubjects = [
  { value: "advanced_math", label: "Toán cao cấp" },
  { value: "calculus", label: "Giải tích" },
  { value: "algebra", label: "Đại số" },
  { value: "probability_statistics", label: "Xác suất thống kê" },
  { value: "differential_equations", label: "Phương trình vi phân" },
]

const documentTypes = {
  primary: [
    { value: "textbook", label: "SGK" },
    { value: "exercise_book", label: "SBT" },
    { value: "special_topic", label: "Chuyên đề/Đề thi" },
  ],
  secondary: [
    { value: "textbook", label: "SGK" },
    { value: "exercise_book", label: "SBT" },
    { value: "special_topic", label: "Chuyên đề/Đề thi" },
  ],
  highschool: [
    { value: "textbook", label: "SGK" },
    { value: "exercise_book", label: "SBT" },
    { value: "special_topic", label: "Chuyên đề/Đề thi" },
  ],
  university: [
    { value: "textbook", label: "Giáo trình" },
    { value: "exercise", label: "Bài tập" },
    { value: "reference", label: "Tài liệu tham khảo" },
  ],
}

const DocumentList = () => {
  const location = useLocation()
  const path = location.pathname.split("/")[2] || "grade1"
  const [documents, setDocuments] = useState([])
  const [popularDocuments, setPopularDocuments] = useState([])
  const [filters, setFilters] = useState({
    grade: "",
    subject: "",
    documentType: "",
    tag: "",
    search: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10
  const [viewedDocs, setViewedDocs] = useState(JSON.parse(localStorage.getItem("viewedDocs")) || [])

  const fetchDocs = useCallback(async () => {
    setIsLoading(true)
    const level = educationLevelMap[path]?.value
    const queryFilters = {
      educationLevel: level,
      documentType: filters.documentType,
      tag: filters.tag,
      search: filters.search,
      page: currentPage,
      limit: itemsPerPage,
    }

    if (path === "university") {
      queryFilters.subject = filters.subject
    } else {
      queryFilters.grade = filters.grade
    }

    try {
      const { data: documents, totalPages } = filters.search
        ? await searchDocuments(queryFilters)
        : await getDocuments(queryFilters)
      setDocuments(documents || [])
      setTotalPages(totalPages || 1)
      setError(null)
    } catch (error) {
      console.error("Error fetching documents:", error)
      setDocuments([])
      setError("Không thể tải dữ liệu tài liệu. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }, [path, filters, currentPage])

  const fetchPopularDocs = useCallback(async () => {
    try {
      const docs = await getPopularDocuments({
        limit: 4,
        educationLevel: educationLevelMap[path]?.value,
      })
      setPopularDocuments(docs || [])
    } catch (error) {
      console.error("Error fetching popular documents:", error)
      setPopularDocuments([])
    }
  }, [path])

  useEffect(() => {
    fetchDocs()
    fetchPopularDocs()
  }, [fetchDocs, fetchPopularDocs])

  useEffect(() => {
    setFilters({
      grade: "",
      subject: "",
      documentType: "",
      tag: "",
      search: "",
    })
    setCurrentPage(1)
  }, [path])

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        setFilters((prev) => ({ ...prev, search: query }))
        setCurrentPage(1)
      }, 300),
    [],
  )

  const resetFilters = () => {
    setFilters({
      grade: "",
      subject: "",
      documentType: "",
      tag: "",
      search: "",
    })
    setCurrentPage(1)
  }

  const handleSearch = (query) => {
    debouncedSearch(query)
  }

  const handleViewDoc = (docId) => {
    const updatedViewed = [docId, ...viewedDocs.filter((id) => id !== docId)].slice(0, 5)
    setViewedDocs(updatedViewed)
    localStorage.setItem("viewedDocs", JSON.stringify(updatedViewed))
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="container document-container">
      <Helmet>
        <title>FunMath - Tài liệu {educationLevelMap[path]?.label || "Toán học"}</title>
        <meta
          name="description"
          content={`Khám phá tài liệu Toán học ${
            educationLevelMap[path]?.label || ""
          }, bao gồm sách giáo khoa, bài tập, và chuyên đề.`}
        />
      </Helmet>
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        className="documents-section"
      >
        <h2 className="section-title">Tài liệu {educationLevelMap[path]?.label || "Toán học"}</h2>

        <div className="document-tabs">
          <Link to="/documents/grade1" className={path === "grade1" ? "active" : ""}>
            Tiểu học
          </Link>
          <Link to="/documents/grade2" className={path === "grade2" ? "active" : ""}>
            THCS
          </Link>
          <Link to="/documents/grade3" className={path === "grade3" ? "active" : ""}>
            THPT
          </Link>
          <Link to="/documents/university" className={path === "university" ? "active" : ""}>
            Đại học
          </Link>
        </div>

        <div className="filters">
          <SearchBar onSearch={handleSearch} placeholder="Tìm kiếm tài liệu..." />
          <select
            value={filters.documentType}
            onChange={(e) => setFilters({ ...filters, documentType: e.target.value })}
            className="filter-select"
          >
            <option value="">Loại tài liệu</option>
            {documentTypes[educationLevelMap[path]?.value]?.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {path === "university" ? (
            <select
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value, grade: "" })}
              className="filter-select"
            >
              <option value="">Môn học</option>
              {universitySubjects.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={filters.grade}
              onChange={(e) => setFilters({ ...filters, grade: e.target.value, subject: "" })}
              className="filter-select"
            >
              <option value="">Lớp</option>
              {gradeMap[educationLevelMap[path]?.value]?.map((grade) => (
                <option key={grade} value={grade}>
                  Lớp {grade}
                </option>
              ))}
            </select>
          )}
          <button onClick={resetFilters} className="reset-button">
            <i className="fas fa-sync-alt"></i> Xóa bộ lọc
          </button>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button onClick={fetchDocs} className="retry-button">
              Thử lại
            </button>
          </div>
        )}

        {popularDocuments.length > 0 && (
          <div className="popular-documents">
            <h3 className="popular-title">Tài liệu nổi bật</h3>
            <div className="document-grid">
              {popularDocuments.map((doc) => (
                <Link
                  key={doc._id}
                  to={`/documents/${doc._id}`}
                  onClick={() => handleViewDoc(doc._id)}
                  className="document-card"
                >
                  <div className="document-thumbnail">
                    <img
                      src={doc.thumbnail || "/assets/images/default-doc.png"}
                      alt={doc.title}
                      loading="lazy"
                      onError={(e) => (e.target.src = "/assets/images/default-doc.png")}
                    />
                  </div>
                  <h4 className="document-title">{doc.title}</h4>
                  <p className="document-stats">
                    <span>
                      <i className="fas fa-download"></i> {doc.downloads || 0}
                    </span>
                    <span>
                      <i className="fas fa-eye"></i> {doc.views || 0}
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {viewedDocs.length > 0 && (
          <div className="viewed-documents">
            <h3 className="viewed-title">Đã xem gần đây</h3>
            <div className="document-grid">
              {viewedDocs.map((docId) => {
                const doc = documents.find((d) => d._id === docId) || { _id: docId, title: "Tài liệu" }
                return (
                  <Link key={docId} to={`/documents/${docId}`} className="document-card">
                    <div className="document-thumbnail">
                      <img
                        src={doc.thumbnail || "/assets/images/default-doc.png"}
                        alt={doc.title}
                        loading="lazy"
                        onError={(e) => (e.target.src = "/assets/images/default-doc.png")}
                      />
                    </div>
                    <h4 className="document-title">{doc.title}</h4>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        <div className="documents-main">
          <h3 className="documents-title">Tất cả tài liệu</h3>

          {isLoading ? (
            <div className="document-grid">
              {[...Array(itemsPerPage)].map((_, i) => (
                <div key={i} className="document-card skeleton">
                  <div className="document-thumbnail skeleton-image" />
                  <div className="skeleton-title" />
                  <div className="skeleton-description" />
                </div>
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="document-grid">
              {documents.map((doc) => (
                <Link
                  key={doc._id}
                  to={`/documents/${doc._id}`}
                  onClick={() => handleViewDoc(doc._id)}
                  className="document-card"
                >
                  <div className="document-thumbnail">
                    <img
                      src={doc.thumbnail || "/assets/images/default-doc.png"}
                      alt={doc.title}
                      loading="lazy"
                      onError={(e) => (e.target.src = "/assets/images/default-doc.png")}
                    />
                  </div>
                  <h4 className="document-title">{doc.title}</h4>
                  <p className="document-description">{doc.description?.slice(0, 80)}...</p>
                  <div className="document-meta">
                    <p className="document-stats">
                      <span>
                        <i className="fas fa-download"></i> {doc.downloads || 0}
                      </span>
                      <span>
                        <i className="fas fa-eye"></i> {doc.views || 0}
                      </span>
                    </p>
                    <p className="document-date">
                      <i className="fas fa-calendar-alt"></i> {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-documents">
              <i className="fas fa-file-alt"></i>
              <p>Không có tài liệu nào phù hợp với bộ lọc hiện tại.</p>
              <button onClick={resetFilters} className="btn-primary">
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <ReactPaginate
            breakLabel="..."
            nextLabel="Tiếp >"
            onPageChange={(event) => setCurrentPage(event.selected + 1)}
            pageRangeDisplayed={5}
            pageCount={totalPages}
            previousLabel="< Trước"
            renderOnZeroPageCount={null}
            containerClassName="pagination"
            activeClassName="active"
          />
        )}
      </motion.section>
    </div>
  )
}

export default DocumentList
