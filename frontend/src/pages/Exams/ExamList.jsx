"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getAllExams, getRecommendedExams } from "../../services/examService";
import { toast } from "react-toastify";
import "./Exam.css";

const ExamList = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [exams, setExams] = useState([]);
  const [recommendedExams, setRecommendedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    educationLevel: "",
    subject: "",
    difficulty: "",
    status: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await getAllExams({
          educationLevel: filters.educationLevel,
          subject: filters.subject,
          difficulty: filters.difficulty,
          status: filters.status,
          search: searchQuery,
        });
        setExams(response.data || []);

        if (isAuthenticated && user) {
          try {
            const recommendedResponse = await getRecommendedExams();
            setRecommendedExams(recommendedResponse.data || []);
          } catch (error) {
            console.error("Không thể lấy đề thi đề xuất:", error);
            setRecommendedExams([]);
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đề thi:", error);
        toast.error("Không thể tải danh sách đề thi");
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [isAuthenticated, user, filters, searchQuery]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const resetFilters = () => {
    setFilters({
      educationLevel: "",
      subject: "",
      difficulty: "",
      status: "",
    });
    setSearchQuery("");
  };

  const filteredExams = exams.filter((exam) => {
    const now = new Date();
    let status = "";
    if (new Date(exam.startTime) > now) status = "upcoming";
    else if (new Date(exam.endTime) < now) status = "ended";
    else status = "ongoing";

    const matchesSearch = exam.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesEducationLevel = filters.educationLevel
      ? exam.educationLevel === filters.educationLevel
      : true;
    const matchesSubject = filters.subject
      ? exam.subject === filters.subject
      : true;
    const matchesDifficulty = filters.difficulty
      ? exam.difficulty === filters.difficulty
      : true;
    const matchesStatus = filters.status ? status === filters.status : true;

    return (
      matchesSearch &&
      matchesEducationLevel &&
      matchesSubject &&
      matchesDifficulty &&
      matchesStatus
    );
  });

  if (loading) {
    return (
      <div className="exam-list-container loading">
        <div className="loading-spinner">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="exam-list-container">
      <h1>Thi đấu</h1>

      <div className="search-filter-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm đề thi..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="filters">
          <select
            name="educationLevel"
            value={filters.educationLevel}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả cấp học</option>
            {[...Array(12).keys()].map((i) => (
              <option key={i + 1} value={`grade${i + 1}`}>
                Lớp {i + 1}
              </option>
            ))}
            <option value="university">Đại học</option>
          </select>

          <select
            name="subject"
            value={filters.subject}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả môn</option>
            <option value="algebra">Đại số</option>
            <option value="geometry">Hình học</option>
            <option value="calculus">Giải tích</option>
            <option value="statistics">Thống kê</option>
          </select>

          <select
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="ongoing">Đang diễn ra</option>
            <option value="ended">Kết thúc</option>
          </select>

          <button className="reset-button" onClick={resetFilters}>
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {isAuthenticated && recommendedExams.length > 0 && (
        <div className="recommended-exams">
          <h2>Đề xuất cho bạn</h2>
          <div className="exam-grid">
            {recommendedExams.map((exam) => (
              <div
                key={exam._id}
                className={`exam-card ${exam.status || "upcoming"}`}
              >
                <div className="exam-card-header">
                  <span className={`difficulty-badge ${exam.difficulty}`}>
                    {exam.difficulty}
                  </span>
                  <h3>{exam.title}</h3>
                </div>
                <div className="exam-card-body">
                  <p>{exam.description}</p>
                  <div className="exam-info">
                    <span>
                      <i className="fas fa-graduation-cap"></i>{" "}
                      {exam.educationLevel}
                    </span>
                    <span>
                      <i className="fas fa-book"></i> {exam.subject}
                    </span>
                    <span>
                      <i className="fas fa-clock"></i> {exam.duration} phút
                    </span>
                    <span>
                      <i className="fas fa-question-circle"></i>{" "}
                      {exam.questions?.length || 0} câu hỏi
                    </span>
                  </div>
                </div>
                <div className="exam-card-footer">
                  <Link to={`/exams/${exam._id}`} className="take-exam-button">
                    Làm bài
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="all-exams">
        <h2>Tất cả đề thi</h2>
        {filteredExams.length > 0 ? (
          <div className="exam-grid">
            {filteredExams.map((exam) => {
              const now = new Date();
              let status = "";
              if (new Date(exam.startTime) > now) status = "upcoming";
              else if (new Date(exam.endTime) < now) status = "ended";
              else status = "ongoing";

              return (
                <div key={exam._id} className={`exam-card ${status}`}>
                  <div className="exam-card-header">
                    <span className={`difficulty-badge ${exam.difficulty}`}>
                      {exam.difficulty}
                    </span>
                    <h3>{exam.title}</h3>
                  </div>
                  <div className="exam-card-body">
                    <p>{exam.description}</p>
                    <div className="exam-info">
                      <span>
                        <i className="fas fa-graduation-cap"></i>{" "}
                        {exam.educationLevel}
                      </span>
                      <span>
                        <i className="fas fa-book"></i> {exam.subject}
                      </span>
                      <span>
                        <i className="fas fa-clock"></i> {exam.duration} phút
                      </span>
                      <span>
                        <i className="fas fa-question-circle"></i>{" "}
                        {exam.questions?.length || 0} câu hỏi
                      </span>
                    </div>
                  </div>
                  <div className="exam-card-footer">
                    <Link
                      to={`/exams/${exam._id}`}
                      className="take-exam-button"
                    >
                      Làm bài
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-exams">
            <p>Không có bài thi nào phù hợp.</p>
          </div>
        )}
      </div>

      {user?.role === "teacher" && (
        <div className="create-exam-container">
          <Link to="/exams/create" className="create-exam-button">
            <i className="fas fa-plus"></i> Tạo đề thi mới
          </Link>
        </div>
      )}
    </div>
  );
};

export default ExamList;
