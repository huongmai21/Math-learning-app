import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import SearchBar from "../../components/common/Search/SearchBar";
import CommentSection from "../../components/common/Comment/CommentSection";
import ReactPaginate from "react-paginate";
import axios from "axios";
import "./Exam.css";

const ExamList = () => {
  const { user } = useSelector((state) => state.auth);
  const [exams, setExams] = useState([]);
  const [recommendedExams, setRecommendedExams] = useState([]);
  const [filters, setFilters] = useState({
    educationLevel: "",
    subject: "",
    status: "",
    difficulty: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [examLeaderboards, setExamLeaderboards] = useState({});
  const [countdowns, setCountdowns] = useState({});
  const itemsPerPage = 9;

  const loadExams = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchQuery,
        page: pageToLoad,
        limit: itemsPerPage,
      };
      const response = await axios.get("http://localhost:5000/exams", {
        params,
      });
      setExams(response.data.exams);
      setTotalPages(response.data.totalPages);
      setPage(pageToLoad);
    } catch (err) {
      toast.error(
        "Lỗi khi tải danh sách đề thi: " + (err.message || "Vui lòng thử lại.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/exams/recommended"
        );
        setRecommendedExams(response.data.recommendedExams);
      } catch (err) {
        console.error("Lỗi khi lấy bài thi gợi ý:", err);
      }
    };
    fetchRecommendations();

    // Cài đặt bộ đếm ngược
    const timer = setInterval(() => {
      const newCountdowns = {};
      exams.forEach((exam) => {
        const now = new Date();
        const startTime = new Date(exam.startTime);
        const endTime = new Date(exam.endTime);
        if (startTime > now) {
          const timeLeft = startTime - now;
          newCountdowns[exam._id] = formatTimeLeft(timeLeft);
        } else if (endTime > now) {
          const timeLeft = endTime - now;
          newCountdowns[exam._id] = formatTimeLeft(timeLeft);
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [filters, searchQuery, exams]);

  const formatTimeLeft = (time) => {
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    return `${days} ngày, ${hours}:${minutes}:${seconds}`;
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFollow = async (examId) => {
    try {
      await axios.post(`http://localhost:5000/exams/${examId}/follow`);
      toast.success("Quan tâm bài thi thành công!");
      loadExams(page);
    } catch (err) {
      toast.error(
        "Quan tâm bài thi thất bại: " + (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const fetchExamLeaderboard = async (examId) => {
    if (examLeaderboards[examId]) return;
    try {
      const response = await axios.get(
        `http://localhost:5000/exams/${examId}/leaderboard`
      );
      setExamLeaderboards((prev) => ({
        ...prev,
        [examId]: response.data.leaderboard,
      }));
    } catch (err) {
      toast.error(
        "Lỗi khi lấy bảng xếp hạng bài thi: " +
          (err.message || "Vui lòng thử lại.")
      );
    }
  };

  const getStatus = (startTime, endTime) => {
    const now = new Date();
    if (startTime > now) return "Sắp diễn ra";
    if (startTime <= now && endTime >= now) return "Đang diễn ra";
    return "Kết thúc";
  };

  const getSubjectLabel = (subject) => {
    switch (subject) {
      case "math":
        return "Toán";
      case "advanced_math":
        return "Toán cao cấp";
      case "calculus":
        return "Giải tích";
      case "algebra":
        return "Đại số";
      case "probability_statistics":
        return "Xác suất thống kê";
      case "differential_equations":
        return "Phương trình vi phân";
      default:
        return subject;
    }
  };

  return (
    <div className="exam-list-container">
      <h2>Thi đấu</h2>

      <SearchBar onSearch={handleSearch} />

      <div className="filters">
        <select
          name="educationLevel"
          onChange={handleFilterChange}
          value={filters.educationLevel}
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
          onChange={handleFilterChange}
          value={filters.subject}
        >
          <option value="">Tất cả môn</option>
          {filters.educationLevel === "university" ? (
            <>
              <option value="advanced_math">Toán cao cấp</option>
              <option value="calculus">Giải tích</option>
              <option value="algebra">Đại số</option>
              <option value="probability_statistics">Xác suất thống kê</option>
              <option value="differential_equations">
                Phương trình vi phân
              </option>
            </>
          ) : (
            <option value="math">Toán</option>
          )}
        </select>
        <select
          name="status"
          onChange={handleFilterChange}
          value={filters.status}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="upcoming">Sắp diễn ra</option>
          <option value="ongoing">Đang diễn ra</option>
          <option value="ended">Kết thúc</option>
        </select>
        <select
          name="difficulty"
          onChange={handleFilterChange}
          value={filters.difficulty}
        >
          <option value="">Tất cả độ khó</option>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
        </select>
        <button
          onClick={() =>
            setFilters({
              educationLevel: "",
              subject: "",
              status: "",
              difficulty: "",
            })
          }
        >
          Xóa bộ lọc
        </button>
      </div>

      {!filters.educationLevel &&
        !filters.subject &&
        !filters.status &&
        !filters.difficulty &&
        !searchQuery && (
          <div className="recommended-exams">
            <h3>Đề xuất cho bạn</h3>
            {recommendedExams.length > 0 ? (
              <div className="exam-grid">
                {recommendedExams.map((exam) => (
                  <div
                    key={exam._id}
                    className={`exam-card ${getStatus(
                      exam.startTime,
                      exam.endTime
                    ).replace(/\s/g, "-")}`}
                  >
                    <h3>{exam.title}</h3>
                    <p>{exam.description?.substring(0, 100)}...</p>
                    <p>
                      Cấp học:{" "}
                      {exam.educationLevel === "university"
                        ? "Đại học"
                        : `Lớp ${exam.educationLevel.replace("grade", "")}`}
                    </p>
                    <p>Môn: {getSubjectLabel(exam.subject)}</p>
                    <Link to={`/exams/${exam._id}`} className="btn">
                      Xem chi tiết
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p>Chưa có bài thi gợi ý.</p>
            )}
          </div>
        )}

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="exam-grid">
          {exams.length > 0 ? (
            exams.map((exam) => (
              <div
                key={exam._id}
                className={`exam-card ${getStatus(
                  exam.startTime,
                  exam.endTime
                ).replace(/\s/g, "-")}`}
              >
                <h3>{exam.title}</h3>
                <p>{exam.description?.substring(0, 100)}...</p>
                <p>
                  Cấp học:{" "}
                  {exam.educationLevel === "university"
                    ? "Đại học"
                    : `Lớp ${exam.educationLevel.replace("grade", "")}`}
                </p>
                <p>Môn: {getSubjectLabel(exam.subject)}</p>
                <p>Độ khó: {exam.difficulty}</p>
                <p>
                  Thời gian bắt đầu: {new Date(exam.startTime).toLocaleString()}
                </p>
                <p>
                  Thời gian kết thúc: {new Date(exam.endTime).toLocaleString()}
                </p>
                <p>Trạng thái: {getStatus(exam.startTime, exam.endTime)}</p>
                {countdowns[exam._id] && (
                  <p>
                    {getStatus(exam.startTime, exam.endTime) === "Sắp diễn ra"
                      ? "Bắt đầu sau: "
                      : "Kết thúc sau: "}
                    {countdowns[exam._id]}
                  </p>
                )}
                <p>Lượt tham gia: {exam.attempts}</p>
                {user && (
                  <button onClick={() => handleFollow(exam._id)}>
                    {exam.followers.includes(user._id)
                      ? "Đã quan tâm"
                      : "Quan tâm"}
                  </button>
                )}
                {getStatus(exam.startTime, exam.endTime) === "Đang diễn ra" && (
                  <Link to={`/exams/${exam._id}`} className="btn">
                    Tham gia
                  </Link>
                )}
                {getStatus(exam.startTime, exam.endTime) === "Kết thúc" && (
                  <Link to={`/exams/${exam._id}/answers`} className="btn">
                    Xem đáp án
                  </Link>
                )}
                <button
                  onClick={() => fetchExamLeaderboard(exam._id)}
                  className="btn"
                >
                  Xem bảng xếp hạng
                </button>
                {examLeaderboards[exam._id] && (
                  <div className="leaderboard-list">
                    {examLeaderboards[exam._id].length > 0 ? (
                      examLeaderboards[exam._id].map((entry, index) => (
                        <div key={entry._id} className="leaderboard-item">
                          <span className="rank">{index + 1}</span>
                          <span className="username">
                            {entry.user.username}
                          </span>
                          <span className="score">
                            Điểm: {entry.totalScore}
                          </span>
                          <span className="time">
                            Thời gian:{" "}
                            {new Date(entry.endTime).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p>Chưa có người tham gia bài thi này.</p>
                    )}
                  </div>
                )}
                <CommentSection referenceId={exam._id} referenceType="exam" />
              </div>
            ))
          ) : (
            <p>Không tìm thấy bài thi nào.</p>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <ReactPaginate
          breakLabel="..."
          nextLabel="Tiếp >"
          onPageChange={(event) => loadExams(event.selected + 1)}
          pageRangeDisplayed={5}
          pageCount={totalPages}
          previousLabel="< Trước"
          renderOnZeroPageCount={null}
          containerClassName="pagination"
          activeClassName="active"
        />
      )}
    </div>
  );
};

export default ExamList;
