import React, { useState, useEffect } from "react";

const StudyCorner = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ title: "", content: "" });

  useEffect(() => {
    fetch("/questions")
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error("Lỗi khi lấy câu hỏi:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newQuestion),
    });
    if (res.ok) {
      const data = await res.json();
      setQuestions([...questions, data]);
      setNewQuestion({ title: "", content: "" });
    }
  };

  return (
    <div>
      <h1>Góc học tập</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tiêu đề câu hỏi"
          value={newQuestion.title}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, title: e.target.value })
          }
        />
        <textarea
          placeholder="Nội dung câu hỏi"
          value={newQuestion.content}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, content: e.target.value })
          }
        />
        <button type="submit">Đăng câu hỏi</button>
      </form>
      <h2>Danh sách câu hỏi</h2>
      {questions.map((q) => (
        <div key={q._id}>
          <h3>{q.title}</h3>
          <p>{q.content}</p>
        </div>
      ))}
    </div>
  );
};

export default StudyCorner;
