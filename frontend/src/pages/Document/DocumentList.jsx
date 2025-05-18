import React, { useEffect, useState, useCallback, useMemo } from "react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import SearchBar from "../../components/common/SearchBar/SearchBar";
import {
  fetchDocuments,
  fetchPopularDocuments,
  searchDocuments,
} from "../../services/documentService";
import { debounce } from "lodash";
import ReactPaginate from "react-paginate";
import "./Document.css";

const educationLevelMap = {
  grade1: { value: "primary", label: "Tiểu học" },
  grade2: { value: "secondary", label: "Trung học cơ sở" },
  grade3: { value: "highschool", label: "Trung học phổ thông" },
  university: { value: "university", label: "Đại học" },
  grade1: { value: "primary", label: "Tiểu học" },
  grade2: { value: "secondary", label: "Trung học cơ sở" },
  grade3: { value: "highschool", label: "Trung học phổ thông" },
  university: { value: "university", label: "Đại học" },
};

const gradeMap = {
  primary: ["1", "2", "3", "4", "5"],
  secondary: ["6", "7", "8", "9"],
  highschool: ["10", "11", "12"],
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

const DocumentList = () => {
  const location = useLocation();
  const path = location.pathname.split("/")[2] || "grade1";
  const path = location.pathname.split("/")[2] || "grade1";
  const [documents, setDocuments] = useState([]);
  const [popularDocuments, setPopularDocuments] = useState([]);
  const [filters, setFilters] = useState({
    grade: "",
    subject: "",
    documentType: "",
    tag: "",
    search: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [viewedDocs, setViewedDocs] = useState(
    JSON.parse(localStorage.getItem("viewedDocs")) || []
  );

  const fetchDocs = useCallback(async () => {
    setIsLoading(true);
    const level = educationLevelMap[path]?.value;
    const queryFilters = {
      educationLevel: level,
      documentType: filters.documentType,
      tag: filters.tag,
      search: filters.search,
      page: currentPage,
      limit: itemsPerPage,
    };

    if (path === "university") {
      queryFilters.subject = filters.subject;
    } else {
      queryFilters.grade = filters.grade;
    }

    try {
      const { data: documents, totalPages } = filters.search
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
      const docs = await fetchPopularDocuments({
        limit: 4,
        educationLevel: educationLevelMap[path]?.value,
      });
      setPopularDocuments(docs);
    } catch (error) {
      console.error("Error fetching popular documents:", error);
    }
  }, [path]);
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
      tag: "",
      search: "",
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
      tag: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    debouncedSearch(query);
  };

  const handleViewDoc = (docId) => {
    const updatedViewed = [
      docId,
      ...viewedDocs.filter((id) => id !== docId),
    ].slice(0, 5);
    setViewedDocs(updatedViewed);
    localStorage.setItem("viewedDocs", JSON.stringify(updatedViewed));
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
                  onClick={() => handleViewDoc(doc._id)}
                  className="document-card"
                >
                  <div className="skeleton-image" />
                  <h4 className="document-title">{doc.title}</h4>
                  <p className="document-stats">
                    Lượt tải: {doc.downloads} | Lượt xem: {doc.views}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
        {viewedDocs.length > 0 && (
          <div className="popular-documents">
            <h3 className="popular-title">Đã xem gần đây</h3>
            <div className="document-grid">
              {viewedDocs.map((docId) => (
                <Link
                  key={docId}
                  to={`/documents/detail/${docId}`}
                  className="document-card"
                >
                  <div className="skeleton-image" />
                  <h4 className="document-title">
                    {documents.find((d) => d._id === docId)?.title ||
                      "Tài liệu"}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="filters">
          <SearchBar onSearch={handleSearch} />
          <select
            value={filters.documentType}
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
          <select
            value={filters.tag}
            onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            className="filter-select"
          >
            <option value="">Thẻ</option>
            {[
              ...new Set(
                documents.flatMap((doc) => doc.tags || []).filter((tag) => tag)
              ),
            ].map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <button onClick={resetFilters} className="reset-button">
            Xóa bộ lọc
          </button>
        </div>
        {isLoading ? (
          <div className="document-grid">
            {[...Array(itemsPerPage)].map((_, i) => (
              <div key={i} className="document-card skeleton">
                <div className="skeleton-image" />
                <div className="skeleton-title" />
                <div className="skeleton-description" />
              </div>
            ))}
          </div>
        ) : (
          <div className="document-grid">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <Link
                  key={doc._id}
                  to={`/documents/detail/${doc._id}`}
                  onClick={() => handleViewDoc(doc._id)}
                  className="document-card"
                >
                  <img
                    src={doc.thumbnail || "/assets/images/default-doc.png"}
                    alt={doc.title}
                    className="document-image"
                    loading="lazy"
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
  );
};

export default DocumentList;
