import React, { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import SearchBar from "../../components/common/Search/SearchBar";
import {
  fetchDocuments,
  fetchPopularDocuments,
  searchDocuments,
} from "../../services/documentService";
import "./Document.css";

const educationLevelMap = {
  grade1: "primary",
  grade2: "secondary",
  grade3: "highschool",
  university: "university",
};

const gradeMap = {
  grade1: ["1", "2", "3", "4", "5"],
  grade2: ["6", "7", "8", "9"],
  grade3: ["10", "11", "12"],
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
  const path = location.pathname.split("/")[2];
  const [documents, setDocuments] = useState([]);
  const [popularDocuments, setPopularDocuments] = useState([]);
  const [filters, setFilters] = useState({
    grade: "",
    subject: "",
    documentType: "",
    search: "",
    minDownloads: "",
    maxDownloads: "",
    sort: "uploadedAt-desc",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDocs = useCallback(async () => {
    setIsLoading(true);
    const level = educationLevelMap[path];
    const [sortBy, sortOrder] = filters.sort.split("-");
    const queryFilters = {
      educationLevel: level,
      documentType: filters.documentType,
      search: filters.search,
      minDownloads: filters.minDownloads,
      maxDownloads: filters.maxDownloads,
      sortBy,
      sortOrder,
      page: currentPage,
    };

    if (path === "university") {
      queryFilters.subject = filters.subject;
    } else {
      queryFilters.grade = filters.grade;
    }

    try {
      const { documents, totalPages } = filters.search
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
      const docs = await fetchPopularDocuments({ limit: 4 });
      setPopularDocuments(docs);
    } catch (error) {
      console.error("Error fetching popular documents:", error);
    }
  }, []);

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
      minDownloads: "",
      maxDownloads: "",
      sort: "uploadedAt-desc",
    });
    setCurrentPage(1);
  }, [path]);

  const resetFilters = () => {
    setFilters({
      grade: "",
      subject: "",
      documentType: "",
      search: "",
      minDownloads: "",
      maxDownloads: "",
      sort: "uploadedAt-desc",
    });
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    setFilters({ ...filters, search: query });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="doclist-container">
      <h2>Tài liệu {path?.toUpperCase()}</h2>

      {popularDocuments.length > 0 && (
        <div className="popular-docs">
          <h3>Tài liệu nổi bật</h3>
          <div className="doc-grid">
            {popularDocuments.map((doc) => (
              <Link
                key={doc._id}
                to={`/documents/detail/${doc._id}`}
                className="doc-card"
              >
                <img
                  src={doc.thumbnail || "/assets/images/default-doc.png"}
                  alt="thumbnail"
                />
                <h4>{doc.title}</h4>
                <p className="doc-meta">
                  Lượt tải: {doc.downloads} | Lượt xem: {doc.views}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="filters">
        <SearchBar onSearch={handleSearch} />
        {path === "university" ? (
          <select
            value={filters.subject}
            onChange={(e) =>
              setFilters({ ...filters, subject: e.target.value, grade: "" })
            }
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
          >
            <option value="">Lớp</option>
            {gradeMap[path]?.map((grade) => (
              <option key={grade} value={grade}>
                Lớp {grade}
              </option>
            ))}
          </select>
        )}
        <select
          value={filters.documentType}
          onChange={(e) =>
            setFilters({ ...filters, documentType: e.target.value })
          }
        >
          <option value="">Loại tài liệu</option>
          {documentTypes[educationLevelMap[path]]?.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Tải tối thiểu"
          value={filters.minDownloads}
          onChange={(e) =>
            setFilters({ ...filters, minDownloads: e.target.value })
          }
          className="filter-input"
        />
        <input
          type="number"
          placeholder="Tải tối đa"
          value={filters.maxDownloads}
          onChange={(e) =>
            setFilters({ ...filters, maxDownloads: e.target.value })
          }
          className="filter-input"
        />
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button onClick={resetFilters} className="reset-button">
          Xóa
        </button>
      </div>

      {isLoading ? (
        <p>Đang tải tài liệu...</p>
      ) : (
        <div className="doc-grid">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <Link
                key={doc._id}
                to={`/documents/detail/${doc._id}`}
                className="doc-card"
              >
                <img
                  src={doc.thumbnail || "/assets/images/default-doc.png"}
                  alt="thumbnail"
                />
                <h4>{doc.title}</h4>
                <p>{doc.description?.slice(0, 80)}...</p>
                <p className="doc-meta">
                  Lượt tải: {doc.downloads} | Lượt xem: {doc.views} | Ngày đăng:{" "}
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
                <span className="view-link">Xem chi tiết →</span>
              </Link>
            ))
          ) : (
            <p>Không có tài liệu nào phù hợp.</p>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-button"
          >
            Trước
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`page-button ${currentPage === i + 1 ? "active" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-button"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
