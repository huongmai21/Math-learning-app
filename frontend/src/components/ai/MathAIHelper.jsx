"use client"

import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { askMathQuestion } from "../../services/aiService"
import "./MathAIHelper.css"

const MathAIHelper = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const { user } = useSelector((state) => state.auth)
  const chatContainerRef = useRef(null)
  const fileInputRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)

  // Cuộn xuống cuối cuộc trò chuyện khi có tin nhắn mới
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // Lấy lịch sử trò chuyện từ localStorage khi component được mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("mathAiMessages")
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        setMessages(parsedMessages)
        if (parsedMessages.length > 0) {
          setShowIntro(false)
        }
      } catch (error) {
        console.error("Error parsing saved messages:", error)
      }
    }
  }, [])

  // Lưu lịch sử trò chuyện vào localStorage khi messages thay đổi
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("mathAiMessages", JSON.stringify(messages))
    }
  }, [messages])

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const minimizeChat = () => {
    setIsMinimized(!isMinimized)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!question.trim() && !uploadedFile) {
      toast.warning("Vui lòng nhập câu hỏi hoặc tải lên hình ảnh")
      return
    }

    const newUserMessage = {
      id: Date.now(),
      text: question,
      sender: "user",
      image: imagePreview,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setIsLoading(true)
    setShowIntro(false)
    setQuestion("")
    setImagePreview(null)
    setUploadedFile(null)

    try {
      const formData = new FormData()
      formData.append("question", question)
      if (uploadedFile) {
        formData.append("image", uploadedFile)
      }

      const response = await askMathQuestion(formData)

      const newAiMessage = {
        id: Date.now() + 1,
        text: response.answer || "Xin lỗi, tôi không thể trả lời câu hỏi này.",
        sender: "ai",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, newAiMessage])
    } catch (error) {
      console.error("Error asking math question:", error)
      toast.error("Không thể xử lý câu hỏi. Vui lòng thử lại sau.")

      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.",
        sender: "ai",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.match("image.*")) {
      toast.error("Vui lòng chọn file hình ảnh")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB")
      return
    }

    setUploadedFile(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const clearChat = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả tin nhắn?")) {
      setMessages([])
      localStorage.removeItem("mathAiMessages")
      setShowIntro(true)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (!user) return null

  return (
    <div className={`math-ai-helper ${isOpen ? "open" : ""} ${isMinimized ? "minimized" : ""}`}>
      <div className="chat-header">
        <div className="chat-title">
          <i className="fas fa-robot"></i>
          <span>Trợ lý Toán học</span>
        </div>
        <div className="chat-actions">
          <button className="minimize-btn" onClick={minimizeChat}>
            <i className={`fas ${isMinimized ? "fa-expand" : "fa-minus"}`}></i>
          </button>
          <button className="close-btn" onClick={toggleChat}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div className="chat-body">
        <div className="chat-messages" ref={chatContainerRef}>
          {showIntro ? (
            <div className="chat-intro">
              <div className="ai-avatar">
                <i className="fas fa-robot"></i>
              </div>
              <h3>Xin chào, {user.username}!</h3>
              <p>Tôi là trợ lý Toán học AI. Tôi có thể giúp bạn:</p>
              <ul>
                <li>Giải các bài toán</li>
                <li>Giải thích các khái niệm toán học</li>
                <li>Hướng dẫn giải từng bước</li>
                <li>Nhận diện và giải toán từ hình ảnh</li>
              </ul>
              <p>Hãy đặt câu hỏi hoặc tải lên hình ảnh bài toán để bắt đầu!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.image && (
                    <div className="message-image">
                      <img src={message.image || "/placeholder.svg"} alt="Uploaded" />
                    </div>
                  )}
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message ai loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="chat-input">
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview || "/placeholder.svg"} alt="Preview" />
              <button type="button" className="remove-image" onClick={removeImage}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
          <div className="input-container">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Nhập câu hỏi Toán học..."
              disabled={isLoading}
            />
            <div className="input-actions">
              <button type="button" className="upload-btn" onClick={triggerFileInput} disabled={isLoading}>
                <i className="fas fa-image"></i>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="clear-btn"
                onClick={clearChat}
                disabled={isLoading || messages.length === 0}
              >
                <i className="fas fa-trash"></i>
              </button>
              <button type="submit" className="send-btn" disabled={isLoading && !question.trim() && !uploadedFile}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </form>
      </div>

      <button className="chat-toggle" onClick={toggleChat}>
        <i className="fas fa-robot"></i>
      </button>
    </div>
  )
}

export default MathAIHelper
