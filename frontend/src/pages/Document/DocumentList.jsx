import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import {
  fetchDocuments,
  fetchPopularDocuments,
  searchDocuments,
} from "../../services/documentService";
import { debounce } from "lodash";
import "./Document.css";

const educationLevelMap = {
  grade1: { value: "primary", label: "Tiểu học" },
  grade2: { value: "secondary", label: "Trung học cơ sở" },
  grade3: { value: "highschool", label: "Trung học phổ thông" },
  university: { value: "university", label: "Đại học" },
};

const gradeMap = {
  primary: ["1", "2", "3", "4", "5"],
  secondary: ["6", "7", "8", "9"],
  highschool: ["10", "11", "12"],
};

const universitySubjects = [
  { value: "advanced_math", label: "Toán cao cấp" },
  { value: "calculus", label: "Giải tích" },
  { value: "algebra", label: "Đại số" },
  { value: "probability_statistics", label: "Xác suất thống kê" },
  { value: "differential_equations", label: "Phương trình vi phân" },
];

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
};

const sortOptions = [
  { value: "uploadedAt-desc", label: "Mới nhất" },
  { value: "downloads-desc", label: "Tải nhiều" },
  { value: "views-desc", label: "Xem nhiều" },
];

const DocumentList = () => {
  const location = useLocation();
  const path = location.pathname.split("/")[2] || "grade1";
  const [documents, setDocuments] = useState([]);
  const [popularDocuments, setPopularDocuments] = useState([]);
  const [filters, setFilters] = useState({
    grade: "",
    subject: "",
    documentType: "",
    search: "",
    sort: "uploadedAt-desc",
    dateFrom: "",
    dateTo: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchDocs = useCallback(async () => {
    setIsLoading(true);
    const level = educationLevelMap[path]?.value;
    const [sortBy, sortOrder] = filters.sort.split("-");
    const queryFilters = {
      educationLevel: level,
      documentType: filters.documentType,
      search: filters.search,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: itemsPerPage,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    };

    if (path === "university") {
      queryFilters.subject = filters.subject;
    } else {
      queryFilters.grade = filters.grade;
    }

    try {
      const { data: documents, totalPages } = filters.search
        ? await searchDocuments(queryFilters)
        : await fetchDocuments(queryFilters);
      setDocuments(documents);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [path, filters, currentPage]);

  const fetchPopularDocs = useCallback(async () => {
    try {
      const docs = await fetchPopularDocuments({
        limit: 4,
        educationLevel: educationLevelMap[path]?.value,
      });
      setPopularDocuments(docs);
    } catch (error) {
      console.error("Error fetching popular documents:", error);
    }
  }, [path]);

  useEffect(() => {
    fetchDocs();
    fetchPopularDocs();
  }, [fetchDocs, fetchPopularDocs]);

  useEffect(() => {
    setFilters({
      grade: "",
      subject: "",
      documentType: "",
      search: "",
      sort: "uploadedAt-desc",
      dateFrom: "",
      dateTo: "",
    });
    setCurrentPage(1);
  }, [path]);

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        setFilters((prev) => ({ ...prev, search: query }));
        setCurrentPage(1);
      }, 300),
    []
  );

  const resetFilters = () => {
    setFilters({
      grade: "",
      subject: "",
      documentType: "",
      search: "",
      sort: "uploadedAt-desc",
      dateFrom: "",
      dateTo: "",
    });
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    debouncedSearch(query);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="container">
      <Helmet>
        <title>FunMath - Tài liệu {educationLevelMap[path]?.label}</title>
        <meta
          name="description"
          content={`Khám phá tài liệu Toán học ${educationLevelMap[path]?.label}, bao gồm sách giáo khoa, bài tập, và chuyên đề.`}
        />
      </Helmet>
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
        className="documents-section"
      >
        <h2 className="section-title">
          Tài liệu {educationLevelMap[path]?.label}
        </h2>
        {popularDocuments.length > 0 && (
          <div className="popular-documents">
            <h3 className="popular-title">Tài liệu nổi bật</h3>
            <div className="document-grid">
              {popularDocuments.map((doc) => (
                <Link
                  key={doc._id}
                  to={`/documents/detail/${doc._id}`}
                  className="document-card"
                >
                  <img
                    src={doc.thumbnail || "/assets/images/default-doc.png"}
                    alt={doc.title}
                    className="document-image"
                  />
                  <h4 className="document-title">{doc.title}</h4>
                  <p className="document-stats">
                    Lượt tải: {doc.downloads} | Lượt xem: {doc.views}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="filters">
          <SearchBar onSearch={handleSearch} />
          <select
            value={filters.documentType}
            onChange={(e) =>
              setFilters({ ...filters, documentType: e.target.value })
            }
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
              onChange={(e) =>
                setFilters({ ...filters, subject: e.target.value, grade: "" })
              }
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
              onChange={(e) =>
                setFilters({ ...filters, grade: e.target.value, subject: "" })
              }
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
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters({ ...filters, dateFrom: e.target.value })
            }
            className="filter-select"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="filter-select"
            placeholder="Đến ngày"
          />
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="filter-select"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button onClick={resetFilters} className="reset-button">
            Xóa bộ lọc
          </button>
        </div>
        {isLoading ? (
          <p className="loading-text">Đang tải tài liệu...</p>
        ) : (
          <div className="document-grid">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <Link
                  key={doc._id}
                  to={`/documents/detail/${doc._id}`}
                  className="document-card"
                >
                  <img
                    src={doc.thumbnail || "/assets/images/default-doc.png"}
                    alt={doc.title}
                    className="document-image"
                  />
                  <h4 className="document-title">{doc.title}</h4>
                  <p className="document-description">
                    {doc.description?.slice(0, 80)}...
                  </p>
                  <p className="document-stats">
                    Lượt tải: {doc.downloads} | Lượt xem: {doc.views} | Ngày
                    đăng: {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </Link>
              ))
            ) : (
              <p className="no-documents">Không có tài liệu nào phù hợp.</p>
            )}
          </div>
        )}
        <p style={{ textAlign: "center", color: "#666" }}>
          Hiển thị {documents.length} tài liệu trên trang {currentPage} của{" "}
          {totalPages}
        </p>
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Trước
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`pagination-button ${
                  currentPage === i + 1 ? "active" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Sau
            </button>
          </div>
        )}
      </motion.section>
    </div>
  );
};

export default DocumentList;
