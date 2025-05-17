"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  likePost,
  bookmarkPost,
  getBookmarkedPosts,
  updatePostStatus,
  updateAiResponse,
  uploadPostImage,
  uploadPostFile,
} from "../../services/postService.js"
import { getComments, createComment, deleteComment, likeComment } from "../../services/commentService.js"
import "./StudyCorner.css"

const StudyCorner = () => {
  const { id, tab = "exercises" } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [activeTab, setActiveTab] = useState(tab) // exercises, learning, sharing, bookmarks
  const [posts, setPosts] = useState([])
  const [currentPost, setCurrentPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [subject, setSubject] = useState("")
  const [status, setStatus] = useState("")
  const [search, setSearch] = useState("")
  const [searchImage, setSearchImage] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isProcessingAi, setIsProcessingAi] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    category: "exercise",
    subject: "highschool",
    status: "open",
    images: [],
    files: [],
  })

  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)

  // Chuyển tab khi URL thay đổi
  useEffect(() => {
    if (tab) {
      setActiveTab(tab)
    }
  }, [tab])

  // Load bài đăng theo tab
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true)
      try {
        let response

        switch (activeTab) {
          case "exercises":
            response = await getPosts({
              page,
              category: "exercise",
              subject,
              status,
              sortBy: "createdAt",
              sortOrder: "desc",
            })
            break
          case "learning":
            response = await getPosts({
              page,
              category: "question",
              subject,
              sortBy: "createdAt",
              sortOrder: "desc",
            })
            break
          case "sharing":
            response = await getPosts({
              page,
              category: "share",
              sortBy: "createdAt",
              sortOrder: "desc",
            })
            break
          case "bookmarks":
            response = await getBookmarkedPosts({ page })
            break
          default:
            response = await getPosts({ page })
        }

        setPosts(response.data)
        setTotalPages(response.totalPages)
      } catch (error) {
        toast.error(error.message || "Không thể tải danh sách bài đăng")
      } finally {
        setLoading(false)
      }
    }

    if (!id) {
      loadPosts()
    }
  }, [activeTab, page, subject, status, id])

  // Load chi tiết bài đăng khi ID thay đổi
  useEffect(() => {
    if (id) {
      const loadPostDetails = async () => {
        setLoading(true)
        try {
          const response = await getPostById(id)
          setCurrentPost(response.data)

          // Load comments
          loadComments(id)
        } catch (error) {
          toast.error(error.message || "Không thể tải chi tiết bài đăng")
          navigate("/study-corner")
        } finally {
          setLoading(false)
        }
      }

      loadPostDetails()
    } else {
      setCurrentPost(null)
      setComments([])
    }
  }, [id, navigate])

  // Load comments
  const loadComments = async (postId) => {
    setCommentsLoading(true)
    try {
      const response = await getComments(postId)
      setComments(response.data)
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setCommentsLoading(false)
    }
  }

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)

    if (files.length === 0) return

    const uploadPromises = files.map(async (file) => {
      try {
        const response = await uploadPostImage(file)
        return response.data.url
      } catch (error) {
        toast.error(`Không thể tải lên hình ảnh: ${file.name}`)
        return null
      }
    })

    const uploadedUrls = await Promise.all(uploadPromises)
    const validUrls = uploadedUrls.filter(Boolean)

    setFormData({
      ...formData,
      images: [...formData.images, ...validUrls],
    })
  }

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)

    if (files.length === 0) return

    const uploadPromises = files.map(async (file) => {
      try {
        const response = await uploadPostFile(file)
        return response.data
      } catch (error) {
        toast.error(`Không thể tải lên file: ${file.name}`)
        return null
      }
    })

    const uploadedFiles = await Promise.all(uploadPromises)
    const validFiles = uploadedFiles.filter(Boolean)

    setFormData({
      ...formData,
      files: [...formData.files, ...validFiles],
    })
  }

  // Handle create post form submission
  const handleCreatePost = async (e) => {
    e.preventDefault()

    try {
      const response = await createPost(formData)
      toast.success("Tạo bài đăng thành công!")
      navigate(`/study-corner/${response.data._id}`)
      setShowCreateForm(false)
      setFormData({
        title: "",
        content: "",
        tags: "",
        category: activeTab === "exercises" ? "exercise" : activeTab === "learning" ? "question" : "share",
        subject: "highschool",
        status: "open",
        images: [],
        files: [],
      })
    } catch (error) {
      toast.error(error.message || "Không thể tạo bài đăng")
    }
  }

  // Handle like post
  const handleLikePost = async (postId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thích bài đăng")
      return
    }

    try {
      const response = await likePost(postId)

      if (currentPost && currentPost._id === postId) {
        setCurrentPost({
          ...currentPost,
          likes: response.data.likes,
        })
      } else {
        setPosts(posts.map((post) => (post._id === postId ? { ...post, likes: response.data.likes } : post)))
      }

      toast.success(response.data.isLiked ? "Đã thích bài đăng" : "Đã bỏ thích bài đăng")
    } catch (error) {
      toast.error(error.message || "Không thể thích bài đăng")
    }
  }

  // Handle bookmark post
  const handleBookmarkPost = async (postId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh dấu bài đăng")
      return
    }

    try {
      const response = await bookmarkPost(postId)

      if (currentPost && currentPost._id === postId) {
        setCurrentPost({
          ...currentPost,
          bookmarks: response.data.bookmarks,
        })
      } else {
        setPosts(posts.map((post) => (post._id === postId ? { ...post, bookmarks: response.data.bookmarks } : post)))
      }

      toast.success(response.data.isBookmarked ? "Đã đánh dấu bài đăng" : "Đã bỏ đánh dấu bài đăng")
    } catch (error) {
      toast.error(error.message || "Không thể đánh dấu bài đăng")
    }
  }

  // Handle delete post
  const handleDeletePost = async (postId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài đăng này?")) {
      try {
        await deletePost(postId)
        toast.success("Xóa bài đăng thành công!")

        if (currentPost && currentPost._id === postId) {
          navigate("/study-corner")
        } else {
          setPosts(posts.filter((post) => post._id !== postId))
        }
      } catch (error) {
        toast.error(error.message || "Không thể xóa bài đăng")
      }
    }
  }

  // Handle update post status
  const handleUpdateStatus = async (postId, newStatus) => {
    try {
      const response = await updatePostStatus(postId, newStatus)

      if (currentPost && currentPost._id === postId) {
        setCurrentPost({
          ...currentPost,
          status: response.data.status,
        })
      } else {
        setPosts(posts.map((post) => (post._id === postId ? { ...post, status: response.data.status } : post)))
      }

      toast.success("Cập nhật trạng thái thành công!")
    } catch (error) {
      toast.error(error.message || "Không thể cập nhật trạng thái")
    }
  }

  // Handle create comment
  const handleCreateComment = async (e) => {
    e.preventDefault()

    if (!commentText.trim() || !currentPost) return

    try {
      const response = await createComment({
        postId: currentPost._id,
        content: commentText,
      })

      setComments([...comments, response.data])
      setCommentText("")

      // Nếu là bài tập và trạng thái đang mở, cập nhật thành đang chờ
      if (currentPost.category === "exercise" && currentPost.status === "open") {
        handleUpdateStatus(currentPost._id, "pending")
      }
    } catch (error) {
      toast.error(error.message || "Không thể tạo bình luận")
    }
  }

  // Handle like comment
  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thích bình luận")
      return
    }

    try {
      const response = await likeComment(commentId)

      setComments(
        comments.map((comment) => (comment._id === commentId ? { ...comment, likes: response.data.likes } : comment)),
      )
    } catch (error) {
      toast.error(error.message || "Không thể thích bình luận")
    }
  }

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      try {
        await deleteComment(commentId)
        setComments(comments.filter((comment) => comment._id !== commentId))
        toast.success("Xóa bình luận thành công!")
      } catch (error) {
        toast.error(error.message || "Không thể xóa bình luận")
      }
    }
  }

  // Handle AI response
  const handleAiResponse = async () => {
    if (!currentPost) return

    setIsProcessingAi(true)

    try {
      // Giả lập xử lý AI (trong thực tế, bạn sẽ gọi API AI)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Tạo câu trả lời mẫu dựa trên nội dung bài đăng
      const sampleResponse = `Dựa trên bài toán của bạn, tôi có thể giúp giải như sau:
      
      **Phân tích bài toán:**
      ${currentPost.title}
      
      **Cách giải:**
      1. Đầu tiên, chúng ta cần xác định các biến và điều kiện.
      2. Áp dụng công thức phù hợp với bài toán.
      3. Giải phương trình và tìm kết quả.
      
      **Kết quả:**
      Sau khi tính toán, chúng ta có đáp án là x = 5.
      
      Hy vọng điều này giúp ích cho bạn! Nếu bạn cần giải thích thêm, hãy cho tôi biết.`

      setAiResponse(sampleResponse)

      // Cập nhật câu trả lời AI vào bài đăng
      await updateAiResponse(currentPost._id, sampleResponse)

      // Cập nhật state
      setCurrentPost({
        ...currentPost,
        aiResponse: sampleResponse,
        isAiAnswered: true,
      })

      toast.success("Đã nhận được câu trả lời từ AI!")
    } catch (error) {
      toast.error("Không thể xử lý yêu cầu AI")
    } finally {
      setIsProcessingAi(false)
    }
  }

  // Handle search by image
  const handleSearchByImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSearchImage(file)

    // Giả lập tìm kiếm bằng hình ảnh
    setLoading(true)
    try {
      // Trong thực tế, bạn sẽ tải lên hình ảnh và gửi đến API nhận dạng
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Giả lập kết quả tìm kiếm
      const response = await getPosts({
        category: "exercise",
        subject: "highschool",
        limit: 5,
      })

      setPosts(response.data)
      setTotalPages(response.totalPages)

      toast.success("Đã tìm kiếm bằng hình ảnh!")
    } catch (error) {
      toast.error("Không thể tìm kiếm bằng hình ảnh")
    } finally {
      setLoading(false)
    }
  }

  // Render post list
  const renderPostList = () => {
    if (loading && posts.length === 0) {
      return <div className="loading-spinner">Đang tải...</div>
    }

    if (posts.length === 0) {
      return (
        <div className="empty-state">
          <p>Không có bài đăng nào.</p>
          <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
            Tạo bài đăng mới
          </button>
        </div>
      )
    }

    return (
      <div className="post-list">
        {posts.map((post) => (
          <div key={post._id} className="post-card">
            <div className="post-header">
              <div className="post-author">
                <img
                  src={
                    post.userId?.avatar ||
                    "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png"
                  }
                  alt={post.userId?.username || "Người dùng"}
                  className="author-avatar"
                />
                <div>
                  <h4>{post.userId?.username || "Người dùng"}</h4>
                  <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {post.status && (
                <div className={`post-status ${post.status}`}>
                  {post.status === "open" ? "Đang mở" : post.status === "pending" ? "Đang chờ" : "Đã giải"}
                </div>
              )}
            </div>

            <h3 className="post-title">
              <Link to={`/study-corner/${post._id}`}>{post.title}</Link>
            </h3>

            <div className="post-content-preview">
              {post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
            </div>

            {post.images && post.images.length > 0 && (
              <div className="post-images-preview">
                <img src={post.images[0] || "/placeholder.svg"} alt="Hình ảnh bài đăng" />
                {post.images.length > 1 && <div className="more-images">+{post.images.length - 1}</div>}
              </div>
            )}

            <div className="post-tags">
              {post.tags &&
                post.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                  </span>
                ))}
            </div>

            <div className="post-footer">
              <div className="post-stats">
                <span>
                  <i className="fas fa-eye"></i> {post.views || 0}
                </span>
                <span>
                  <i className="fas fa-comment"></i> {post.commentCount || 0}
                </span>
                <span>
                  <i className="fas fa-heart"></i> {post.likes ? post.likes.length : 0}
                </span>
              </div>

              <div className="post-actions">
                <button
                  className={`action-button ${post.likes && user && post.likes.includes(user._id) ? "liked" : ""}`}
                  onClick={() => handleLikePost(post._id)}
                  aria-label="Thích bài đăng"
                >
                  <i className="fas fa-heart"></i>
                </button>

                <button
                  className={`action-button ${
                    post.bookmarks && user && post.bookmarks.includes(user._id) ? "bookmarked" : ""
                  }`}
                  onClick={() => handleBookmarkPost(post._id)}
                  aria-label="Đánh dấu bài đăng"
                >
                  <i className="fas fa-bookmark"></i>
                </button>

                {user && (post.userId?._id === user._id || user.role === "admin") && (
                  <button
                    className="action-button delete"
                    onClick={() => handleDeletePost(post._id)}
                    aria-label="Xóa bài đăng"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render post detail
  const renderPostDetail = () => {
    if (!currentPost) return null

    const isAuthor = user && currentPost.userId?._id === user._id
    const isLiked = user && currentPost.likes && currentPost.likes.includes(user._id)
    const isBookmarked = user && currentPost.bookmarks && currentPost.bookmarks.includes(user._id)

    return (
      <div className="post-detail">
        <div className="post-detail-header">
          <div className="post-author">
            <img
              src={
                currentPost.userId?.avatar ||
                "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png"
              }
              alt={currentPost.userId?.username || "Người dùng"}
              className="author-avatar"
            />
            <div>
              <h4>{currentPost.userId?.username || "Người dùng"}</h4>
              <span className="post-date">{new Date(currentPost.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="post-actions">
            {currentPost.category === "exercise" && (
              <div className={`post-status ${currentPost.status}`}>
                {currentPost.status === "open" ? "Đang mở" : currentPost.status === "pending" ? "Đang chờ" : "Đã giải"}
              </div>
            )}

            {isAuthor && currentPost.category === "exercise" && (
              <div className="status-actions">
                <button
                  className={`status-button ${currentPost.status === "open" ? "active" : ""}`}
                  onClick={() => handleUpdateStatus(currentPost._id, "open")}
                >
                  Đang mở
                </button>
                <button
                  className={`status-button ${currentPost.status === "pending" ? "active" : ""}`}
                  onClick={() => handleUpdateStatus(currentPost._id, "pending")}
                >
                  Đang chờ
                </button>
                <button
                  className={`status-button ${currentPost.status === "solved" ? "active" : ""}`}
                  onClick={() => handleUpdateStatus(currentPost._id, "solved")}
                >
                  Đã giải
                </button>
              </div>
            )}
          </div>
        </div>

        <h2 className="post-detail-title">{currentPost.title}</h2>

        <div className="post-detail-content">{currentPost.content}</div>

        {currentPost.images && currentPost.images.length > 0 && (
          <div className="post-detail-images">
            {currentPost.images.map((image, index) => (
              <img key={index} src={image || "/placeholder.svg"} alt={`Hình ảnh ${index + 1}`} />
            ))}
          </div>
        )}

        {currentPost.files && currentPost.files.length > 0 && (
          <div className="post-detail-files">
            <h4>Tệp đính kèm:</h4>
            <ul>
              {currentPost.files.map((file, index) => (
                <li key={index}>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-file"></i> {file.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="post-detail-tags">
          {currentPost.tags &&
            currentPost.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
        </div>

        <div className="post-detail-footer">
          <div className="post-stats">
            <span>
              <i className="fas fa-eye"></i> {currentPost.views || 0} lượt xem
            </span>
            <span>
              <i className="fas fa-comment"></i> {comments.length} bình luận
            </span>
            <span>
              <i className="fas fa-heart"></i> {currentPost.likes ? currentPost.likes.length : 0} lượt thích
            </span>
          </div>

          <div className="post-actions">
            <button
              className={`action-button ${isLiked ? "liked" : ""}`}
              onClick={() => handleLikePost(currentPost._id)}
              aria-label="Thích bài đăng"
            >
              <i className="fas fa-heart"></i> Thích
            </button>

            <button
              className={`action-button ${isBookmarked ? "bookmarked" : ""}`}
              onClick={() => handleBookmarkPost(currentPost._id)}
              aria-label="Đánh dấu bài đăng"
            >
              <i className="fas fa-bookmark"></i> Lưu
            </button>

            {(isAuthor || (user && user.role === "admin")) && (
              <button
                className="action-button delete"
                onClick={() => handleDeletePost(currentPost._id)}
                aria-label="Xóa bài đăng"
              >
                <i className="fas fa-trash"></i> Xóa
              </button>
            )}
          </div>
        </div>

        {/* AI Response Section */}
        {currentPost.category === "exercise" && (
          <div className="ai-response-section">
            <div className="ai-response-header">
              <h3>
                <i className="fas fa-robot"></i> Trợ giúp từ AI
              </h3>
              {!currentPost.isAiAnswered && !isProcessingAi && (
                <button className="btn-primary" onClick={handleAiResponse} disabled={isProcessingAi}>
                  <i className="fas fa-magic"></i> Giải bài tập bằng AI
                </button>
              )}
            </div>

            {isProcessingAi ? (
              <div className="ai-processing">
                <div className="spinner"></div>
                <p>Đang xử lý bài toán của bạn...</p>
              </div>
            ) : currentPost.isAiAnswered ? (
              <div className="ai-response-content">
                {currentPost.aiResponse.split("\n").map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            ) : (
              <div className="ai-response-placeholder">
                <p>AI có thể giúp bạn giải bài tập này. Nhấn nút "Giải bài tập bằng AI" để nhận trợ giúp.</p>
              </div>
            )}
          </div>
        )}

        {/* Comments Section */}
        <div className="comments-section">
          <h3>Bình luận ({comments.length})</h3>

          {user ? (
            <form className="comment-form" onSubmit={handleCreateComment}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                required
              />
              <button type="submit" disabled={!commentText.trim()}>
                Gửi bình luận
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>
                Vui lòng <Link to="/auth/login">đăng nhập</Link> để bình luận.
              </p>
            </div>
          )}

          {commentsLoading ? (
            <div className="loading-spinner">Đang tải bình luận...</div>
          ) : comments.length > 0 ? (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment._id} className="comment">
                  <div className="comment-header">
                    <div className="comment-author">
                      <img
                        src={
                          comment.userId?.avatar ||
                          "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746717237/default-avatar_ysrrdy.png"
                        }
                        alt={comment.userId?.username || "Người dùng"}
                        className="author-avatar"
                      />
                      <div>
                        <h4>{comment.userId?.username || "Người dùng"}</h4>
                        <span className="comment-date">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {user && (comment.userId?._id === user._id || user.role === "admin") && (
                      <button
                        className="delete-comment"
                        onClick={() => handleDeleteComment(comment._id)}
                        aria-label="Xóa bình luận"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>

                  <div className="comment-content">{comment.content}</div>

                  <div className="comment-footer">
                    <button
                      className={`like-comment ${
                        user && comment.likes && comment.likes.includes(user._id) ? "liked" : ""
                      }`}
                      onClick={() => handleLikeComment(comment._id)}
                    >
                      <i className="fas fa-heart"></i> {comment.likes ? comment.likes.length : 0}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-comments">
              <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render create post form
  const renderCreateForm = () => {
    return (
      <div className="create-post-form">
        <h2>
          {activeTab === "exercises"
            ? "Đăng bài tập cần giải"
            : activeTab === "learning"
              ? "Đặt câu hỏi học tập"
              : "Chia sẻ kiến thức"}
        </h2>

        <form onSubmit={handleCreatePost}>
          <div className="form-group">
            <label htmlFor="title">Tiêu đề *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              maxLength={200}
              placeholder="Nhập tiêu đề bài đăng..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Nội dung *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={5}
              placeholder="Mô tả chi tiết bài toán hoặc câu hỏi của bạn..."
            />
          </div>

          {activeTab !== "sharing" && (
            <div className="form-group">
              <label htmlFor="subject">Cấp học *</label>
              <select id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required>
                <option value="primary">Tiểu học</option>
                <option value="secondary">THCS</option>
                <option value="highschool">THPT</option>
                <option value="university">Đại học</option>
                <option value="other">Khác</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="tags">Thẻ</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Nhập các thẻ, phân cách bằng dấu phẩy (ví dụ: đại số, hình học, giải tích)"
            />
          </div>

          <div className="form-group">
            <label>Hình ảnh</label>
            <div className="upload-preview">
              {formData.images.map((url, index) => (
                <div key={index} className="image-preview">
                  <img src={url || "/placeholder.svg"} alt={`Preview ${index}`} />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        images: formData.images.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}

              <button type="button" className="upload-button" onClick={() => imageInputRef.current.click()}>
                <i className="fas fa-image"></i> Thêm hình ảnh
              </button>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tệp đính kèm</label>
            <div className="upload-preview">
              {formData.files.map((file, index) => (
                <div key={index} className="file-preview">
                  <i className="fas fa-file"></i> {file.name}
                  <button
                    type="button"
                    className="remove-file"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        files: formData.files.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}

              <button type="button" className="upload-button" onClick={() => fileInputRef.current.click()}>
                <i className="fas fa-paperclip"></i> Thêm tệp đính kèm
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple style={{ display: "none" }} />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              Đăng bài
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Render main content
  return (
    <div className="study-corner-container">
      {/* Sidebar/Navigation */}
      <div className="study-corner-sidebar">
        <h2>Góc học tập</h2>
        <nav>
          <ul>
            <li className={activeTab === "exercises" ? "active" : ""}>
              <Link to="/study-corner?tab=exercises">
                <i className="fas fa-book"></i> Bài tập
              </Link>
            </li>
            <li className={activeTab === "learning" ? "active" : ""}>
              <Link to="/study-corner?tab=learning">
                <i className="fas fa-question-circle"></i> Hỏi đáp
              </Link>
            </li>
            <li className={activeTab === "sharing" ? "active" : ""}>
              <Link to="/study-corner?tab=sharing">
                <i className="fas fa-share-alt"></i> Chia sẻ
              </Link>
            </li>
            <li className={activeTab === "bookmarks" ? "active" : ""}>
              <Link to="/study-corner?tab=bookmarks">
                <i className="fas fa-bookmark"></i> Đã lưu
              </Link>
            </li>
          </ul>
        </nav>

        {/* Filters */}
        {!id && (
          <div className="sidebar-filters">
            <h3>Bộ lọc</h3>

            {(activeTab === "exercises" || activeTab === "learning") && (
              <>
                <div className="filter-group">
                  <label htmlFor="subject-filter">Cấp học</label>
                  <select id="subject-filter" value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option value="">Tất cả</option>
                    <option value="primary">Tiểu học</option>
                    <option value="secondary">THCS</option>
                    <option value="highschool">THPT</option>
                    <option value="university">Đại học</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                {activeTab === "exercises" && (
                  <div className="filter-group">
                    <label htmlFor="status-filter">Trạng thái</label>
                    <select id="status-filter" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="">Tất cả</option>
                      <option value="open">Đang mở</option>
                      <option value="pending">Đang chờ</option>
                      <option value="solved">Đã giải</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="filter-group">
              <label htmlFor="search-filter">Tìm kiếm</label>
              <div className="search-input">
                <input
                  type="text"
                  id="search-filter"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm..."
                />
                <button
                  className="search-button"
                  onClick={() => {
                    // Implement search functionality
                  }}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label>Tìm kiếm bằng hình ảnh</label>
              <button className="image-search-button" onClick={() => imageInputRef.current.click()}>
                <i className="fas fa-camera"></i> Tải lên hình ảnh
              </button>
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleSearchByImage}
                accept="image/*"
                style={{ display: "none" }}
              />

              {searchImage && (
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(searchImage) || "/placeholder.svg"}
                    alt="Search"
                    className="search-image-preview"
                  />
                  <button className="remove-image" onClick={() => setSearchImage(null)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="study-corner-content">
        {/* Header */}
        <div className="content-header">
          <h1>
            {id
              ? currentPost?.title || "Chi tiết bài đăng"
              : activeTab === "exercises"
                ? "Bài tập toán học"
                : activeTab === "learning"
                  ? "Hỏi đáp học tập"
                  : activeTab === "sharing"
                    ? "Chia sẻ kiến thức"
                    : "Bài đăng đã lưu"}
          </h1>

          {!id && !showCreateForm && (
            <button className="btn-primary create-post-button" onClick={() => setShowCreateForm(true)}>
              <i className="fas fa-plus"></i>{" "}
              {activeTab === "exercises" ? "Đăng bài tập" : activeTab === "learning" ? "Đặt câu hỏi" : "Chia sẻ"}
            </button>
          )}
        </div>

        {/* Main Content */}
        {showCreateForm ? renderCreateForm() : id ? renderPostDetail() : renderPostList()}

        {/* Pagination */}
        {!id && !showCreateForm && totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-button"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              <i className="fas fa-chevron-left"></i> Trang trước
            </button>

            <span className="pagination-info">
              Trang {page} / {totalPages}
            </span>

            <button
              className="pagination-button"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Trang sau <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudyCorner
