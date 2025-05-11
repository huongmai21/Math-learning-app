// Hiển thi đề thi, cho phép HS làm bài
// components/TakeExam.jsx
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
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load exam');
        setLoading(false);
      });
  }, [id]);

  const selectAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
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
        toast.success(`Exam submitted! Score: ${data.score}`);
        navigate('/exams');
      } else {
        toast.error(data.message || 'Error submitting exam');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!exam) return <p>Exam not found</p>;

  return (
    <div className="take-exam">
      <h1>{exam.title}</h1>
      <p>{exam.description}</p>
      {questions.map((q, index) => (
        <div key={q._id} className="question">
          <h3>Question {index + 1}: {q.question_text}</h3>
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
              placeholder="Enter your answer"
            />
          )}
        </div>
      ))}
      <button onClick={submitExam}>Submit Exam</button>
    </div>
  );
};

export default TakeExam;