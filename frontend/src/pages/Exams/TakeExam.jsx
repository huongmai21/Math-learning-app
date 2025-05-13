import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Exam.css';

const TakeExam = () => {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/exams/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setExam(data.exam);
        setQuestions(data.questions);
        setLoading(false);

        // Khôi phục câu trả lời từ localStorage (nếu có)
        const savedAnswers = localStorage.getItem(`exam_${id}_answers`);
        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers));
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Không thể tải bài thi');
        setLoading(false);
      });

    // Cài đặt bộ đếm thời gian
    const timer = setInterval(() => {
      if (exam) {
        const now = new Date();
        const endTime = new Date(exam.endTime);
        const timeDiff = endTime - now;
        if (timeDiff <= 0) {
          clearInterval(timer);
          toast.error('Hết thời gian làm bài!');
          submitExam();
        } else {
          setTimeLeft(formatTimeLeft(timeDiff));
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [id, exam]);

  const formatTimeLeft = (time) => {
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
    return `${hours}:${minutes}:${seconds}`;
  };

  const selectAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    // Lưu tạm vào localStorage
    localStorage.setItem(`exam_${id}_answers`, JSON.stringify(newAnswers));
  };

  const saveProgress = () => {
    localStorage.setItem(`exam_${id}_answers`, JSON.stringify(answers));
    toast.success('Đã lưu tiến độ!');
  };

  const submitExam = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/exams/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(`Nộp bài thành công! Điểm: ${data.score}`);
        localStorage.removeItem(`exam_${id}_answers`); // Xóa dữ liệu tạm sau khi nộp
        navigate('/exams');
      } else {
        toast.error(data.message || 'Lỗi khi nộp bài');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi server');
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (!exam) return <p>Không tìm thấy bài thi</p>;

  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="take-exam">
      <h1>{exam.title}</h1>
      <p>{exam.description}</p>
      <p>Tiến độ: {answeredQuestions}/{questions.length} câu đã trả lời</p>
      {timeLeft && <div className="timer">Thời gian còn lại: {timeLeft}</div>}
      {questions.map((q, index) => (
        <div key={q._id} className="question">
          <h3>
            Câu {index + 1}: <span dangerouslySetInnerHTML={{ __html: q.question_text }} />
          </h3>
          {q.question_type === 'multiple_choice' ? (
            q.options.map((option, i) => (
              <div key={i}>
                <input
                  type="radio"
                  name={q._id}
                  value={option}
                  onChange={() => selectAnswer(q._id, option)}
                  checked={answers[q._id] === option}
                />
                <label>{option}</label>
              </div>
            ))
          ) : (
            <textarea
              onChange={(e) => selectAnswer(q._id, e.target.value)}
              value={answers[q._id] || ''}
              placeholder="Nhập câu trả lời của bạn"
            />
          )}
        </div>
      ))}
      <button onClick={saveProgress}>Lưu tạm</button>
      <button onClick={submitExam}>Nộp bài</button>
    </div>
  );
};

export default TakeExam;