// components/CreateExam.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Exam.css';

const CreateExam = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    {
      question_text: '',
      question_type: 'multiple_choice',
      options: ['', '', '', ''],
      correct_answer: '',
    },
  ]);
  const navigate = useNavigate();

  // Kiểm tra vai trò
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  useEffect(() => {
    if (!user || !['admin', 'teacher'].includes(user.role)) {
      toast.error('You do not have permission to access this page');
      navigate('/exams');
    }
  }, [user, navigate]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'multiple_choice',
        options: ['', '', '', ''],
        correct_answer: '',
      },
    ]);
  };

  const updateQuestion = (index, field, value, optionIndex = null) => {
    const newQuestions = [...questions];
    if (field === 'options') {
      newQuestions[index].options[optionIndex] = value;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/exams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          questions,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Exam created successfully!');
        navigate('/exams');
      } else {
        toast.error(data.message || 'Error creating exam');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error');
    }
  };

  // Nếu không có quyền, không render giao diện
  if (!user || !['admin', 'teacher'].includes(user.role)) {
    return null; // Hoặc hiển thị thông báo
  }

  return (
    <div className="create-exam">
      <h1>Create Exam</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <h3>Questions</h3>
        {questions.map((q, index) => (
          <div key={index} className="question-block">
            <label>Question Text:</label>
            <input
              type="text"
              value={q.question_text}
              onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
              required
            />
            <label>Question Type:</label>
            <select
              value={q.question_type}
              onChange={(e) => updateQuestion(index, 'question_type', e.target.value)}
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="short_answer">Short Answer</option>
              <option value="essay">Essay</option>
            </select>
            {q.question_type === 'multiple_choice' && (
              <>
                <label>Options:</label>
                {q.options.map((option, i) => (
                  <input
                    key={i}
                    type="text"
                    value={option}
                    onChange={(e) => updateQuestion(index, 'options', e.target.value, i)}
                    placeholder={`Option ${i + 1}`}
                    required
                  />
                ))}
                <label>Correct Answer:</label>
                <input
                  type="text"
                  value={q.correct_answer}
                  onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                  required
                />
              </>
            )}
          </div>
        ))}
        <button type="button" onClick={addQuestion}>
          Add Question
        </button>
        <button type="submit">Create Exam</button>
      </form>
    </div>
  );
};

export default CreateExam;