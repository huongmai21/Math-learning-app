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
    grade: "",
    subject: "",
    difficulty: "",
    status: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response = await getAllExams();
        setExams(response.data || []);

        // Nếu đã đăng nhập, lấy đề thi được đề xuất
        if (isAuthenticated && user) {
          try {
            const recommendedResponse = await getRecommendedExams();
            setRecommendedExams(recommendedResponse.data || []);
          } catch (error) {
            console.error("Không thể lấy đề thi đề xuất:", error);
            // Không hiển thị toast lỗi khi không thể lấy đề thi đề xuất
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đề thi:", error);
        toast.error("Không thể tải danh sách đề thi");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [isAuthenticated, user]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const resetFilters = () => {
    setFilters({
      grade: "",
      subject: "",
      difficulty: "",
      status: "",
    });
    setSearchQuery("");
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesGrade = filters.grade ? exam.grade === filters.grade : true;
    const matchesSubject = filters.subject
      ? exam.subject === filters.subject
      : true;
    const matchesDifficulty = filters.difficulty
      ? exam.difficulty === filters.difficulty
      : true;
    const matchesStatus = filters.status
      ? exam.status === filters.status
      : true;

    return (
      matchesSearch &&
      matchesGrade &&
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
            name="grade"
            value={filters.grade}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả cấp học</option>
            <option value="primary">Tiểu học</option>
            <option value="secondary">THCS</option>
            <option value="high">THPT</option>
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
            <option value="">Tất cả trạng thái</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">Tất cả độ khó</option>
            <option value="public">Công khai</option>
            <option value="private">Riêng tư</option>
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
              <div key={exam._id} className="exam-card">
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
                      <i className="fas fa-graduation-cap"></i> {exam.grade}
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
            {filteredExams.map((exam) => (
              <div key={exam._id} className="exam-card">
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
                      <i className="fas fa-graduation-cap"></i> {exam.grade}
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
        ) : (
          <div className="no-exams">
            <p>Chưa có bài thi gợi ý.</p>
            <p>Đang tải...</p>
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
