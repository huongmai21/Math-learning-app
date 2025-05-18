"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { askMathQuestion, getMathHistory } from "../../services/aiService";
import "./MathAIHelper.css";

const MathAIHelper = () => {
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [history, setHistory] = useState([]);
  const chatContainerRef = useRef(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Tải lịch sử hội thoại
  useEffect(() => {
    const loadHistory = async () => {
      if (user && isOpen) {
        try {
          setIsHistoryLoading(true);
          const response = await getMathHistory();
          if (response && response.data) {
            setHistory(response.data);
          }
        } catch (error) {
          console.error("Không thể tải lịch sử:", error);
          // Không hiển thị toast lỗi khi không thể tải lịch sử
        } finally {
          setIsHistoryLoading(false);
        }
      }
    };

    loadHistory();
  }, [user, isOpen]);

  // Cuộn xuống cuối cuộc trò chuyện khi có tin nhắn mới
  useEffect(() => {
    if (chatContainerRef.current && isOpen) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [conversations, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question.trim();
    setQuestion("");
    setConversations((prev) => [
      ...prev,
      { role: "user", content: userQuestion },
    ]);
    setIsLoading(true);

    try {
      // Thử gọi API thực
      const response = await askMathQuestion(userQuestion);
      setConversations((prev) => [
        ...prev,
        { role: "assistant", content: response.data.answer },
      ]);
    } catch (error) {
      console.error("Lỗi khi gửi câu hỏi:", error);

      // Tạo phản hồi giả lập khi API không khả dụng
      const mockResponses = [
        "Tôi xin lỗi, hiện tại tôi không thể kết nối với máy chủ. Vui lòng thử lại sau.",
        "Có vẻ như đang có vấn đề với kết nối. Hãy thử lại sau nhé!",
        "Tôi đang gặp khó khăn trong việc xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
      ];

      const randomResponse =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setConversations((prev) => [
        ...prev,
        { role: "assistant", content: randomResponse },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemClick = (item) => {
    setConversations([
      { role: "user", content: item.question },
      { role: "assistant", content: item.answer },
    ]);
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const clearConversation = () => {
    setConversations([]);
  };

  return (
    <div className={`math-ai-helper ${isOpen ? "open" : ""}`}>
      <button className="toggle-button" onClick={toggleChatbot}>
        <i className={`fas ${isOpen ? "fa-times" : "fa-robot"}`}></i>
      </button>

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Trợ lý Toán học</h3>
            <div className="header-actions">
              <button
                className="clear-button"
                onClick={clearConversation}
                title="Xóa cuộc trò chuyện"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <div className="chat-container" ref={chatContainerRef}>
            {conversations.length === 0 ? (
              <div className="welcome-message">
                <h4>Xin chào, {user?.username || "bạn"}!</h4>
                <p>
                  Tôi là trợ lý Toán học AI. Bạn có thể hỏi tôi bất kỳ câu hỏi
                  nào về Toán học.
                </p>
                <div className="example-questions">
                  <p>Ví dụ:</p>
                  <ul>
                    <li
                      onClick={() =>
                        setQuestion("Giải phương trình x^2 - 5x + 6 = 0")
                      }
                    >
                      Giải phương trình x^2 - 5x + 6 = 0
                    </li>
                    <li
                      onClick={() =>
                        setQuestion(
                          "Tính đạo hàm của f(x) = x^3 + 2x^2 - 5x + 1"
                        )
                      }
                    >
                      Tính đạo hàm của f(x) = x^3 + 2x^2 - 5x + 1
                    </li>
                    <li
                      onClick={() =>
                        setQuestion("Tính diện tích hình tròn có bán kính 5cm")
                      }
                    >
                      Tính diện tích hình tròn có bán kính 5cm
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              conversations.map((msg, index) => (
                <div key={index} className={`message ${msg.role}`}>
                  <div className="message-content">
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="message assistant">
                <div className="message-content loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form className="input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Nhập câu hỏi Toán học..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !question.trim()}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>

          {history.length > 0 && (
            <div className="history-container">
              <h4>Lịch sử hỏi đáp</h4>
              {isHistoryLoading ? (
                <div className="loading-history">Đang tải...</div>
              ) : (
                <ul>
                  {history.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleHistoryItemClick(item)}
                    >
                      <span className="history-question">{item.question}</span>
                      <span className="history-date">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MathAIHelper;
