import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import {
  getPosts,
  createPost,
  likePost,
  sharePost,
  addComment,
  bookmarkPost,
} from "../../services/postService";
import {
  getUserSuggestions,
  followUser,
  unfollowUser,
} from "../../services/userService";
import Sidebar from "../../components/layout/Sidebar/Sidebar";
import "./StudyCorner.css";

const StudyCorner = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("exercise");
  const [posts, setPosts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [imageSearchFile, setImageSearchFile] = useState(null);
  const [gradeFilter, setGradeFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostAttachments, setNewPostAttachments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [whoToFollow, setWhoToFollow] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [aiSearchResult, setAiSearchResult] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const exercisesData = await getPosts({
          category: "question",
          page,
          limit: postsPerPage,
        });
        setExercises(
          Array.isArray(exercisesData.data) ? exercisesData.data : []
        );

        const postsData = await getPosts({
          category_ne: "question",
          page,
          limit: postsPerPage,
        });
        setPosts(Array.isArray(postsData.data) ? postsData.data : []);

        const suggestionsData = await getUserSuggestions();
        setWhoToFollow(
          Array.isArray(suggestionsData.data) ? suggestionsData.data : []
        );

        const bookmarksData = await getPosts({ bookmarked: true });
        setBookmarks(
          Array.isArray(bookmarksData.data) ? bookmarksData.data : []
        );

        setTrendingTopics(["Toán học", "Lập trình", "Văn học"]);

        setNotifications([
          {
            id: 1,
            message: "Bài đăng của bạn đã được bình luận!",
            date: "2025-05-07",
          },
          {
            id: 2,
            message: "Câu hỏi của bạn đã được giải đáp!",
            date: "2025-05-06",
          },
        ]);
      } catch (err) {
        setError("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  const handlePostSubmit = async () => {
    if (!newPostContent && !newPostTitle && activeTab === "exercise") {
      toast.error("Vui lòng điền tiêu đề và nội dung!");
      return;
    }
    if (!newPostContent && activeTab !== "exercise") {
      toast.error("Vui lòng điền nội dung!");
      return;
    }
    try {
      const formData = new FormData();
      if (newPostTitle) formData.append("title", newPostTitle);
      formData.append("content", newPostContent);
      formData.append(
        "category",
        activeTab === "exercise" ? "question" : "general"
      );
      if (activeTab === "exercise") {
        formData.append("grade", gradeFilter || "N/A");
        formData.append("subject", subjectFilter || "N/A");
      }
      newPostAttachments.forEach((file) =>
        formData.append("attachments", file)
      );

      const response = await createPost(formData);
      if (activeTab === "exercise") {
        setExercises((prev) => [response.data, ...prev]);
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: `Câu hỏi "${newPostTitle || "Untitled"}" đã được đăng!`,
            date: new Date().toISOString().split("T")[0],
          },
        ]);
      } else {
        setPosts((prev) => [response.data, ...prev]);
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: `Bài đăng "${newPostContent.slice(
              0,
              20
            )}..." đã được đăng!`,
            date: new Date().toISOString().split("T")[0],
          },
        ]);
      }
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostAttachments([]);
      setShowPostForm(false);
      toast.success("Đăng bài thành công!");
    } catch (error) {
      toast.error("Lỗi khi đăng bài!");
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewPostAttachments([...newPostAttachments, ...files]);
  };

  const handleImageSearchUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageSearchFile(file);
    }
  };

  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      if (activeTab === "exercise") {
        setExercises((prev) =>
          prev.map((exercise) =>
            exercise._id === postId
              ? { ...exercise, likes: [...(exercise.likes || []), user?._id] }
              : exercise
          )
        );
      } else {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? { ...post, likes: [...(post.likes || []), user?._id] }
              : post
          )
        );
      }
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Bạn đã thích một bài đăng!",
          date: new Date().toISOString().split("T")[0],
        },
      ]);
      toast.success("Đã thích bài đăng!");
    } catch (error) {
      toast.error("Lỗi khi thích bài đăng!");
    }
  };

  const handleComment = async (postId) => {
    if (!newComment) {
      toast.error("Vui lòng nhập bình luận!");
      return;
    }
    try {
      await addComment(postId, newComment);
      const updatedPosts =
        activeTab === "exercise"
          ? await getPosts({ category: "question", page, limit: postsPerPage })
          : await getPosts({
              category_ne: "question",
              page,
              limit: postsPerPage,
            });
      if (activeTab === "exercise") {
        setExercises(Array.isArray(updatedPosts.data) ? updatedPosts.data : []);
      } else {
        setPosts(Array.isArray(updatedPosts.data) ? updatedPosts.data : []);
      }
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Bạn đã bình luận một bài đăng!",
          date: new Date().toISOString().split("T")[0],
        },
      ]);
      setNewComment("");
      toast.success("Đã thêm bình luận!");
    } catch (error) {
      toast.error("Lỗi khi thêm bình luận!");
    }
  };

  const handleShare = async (postId) => {
    try {
      await sharePost(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? { ...post, shares: (post.shares || 0) + 1 }
            : post
        )
      );
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: "Bạn đã chia sẻ một bài đăng!",
          date: new Date().toISOString().split("T")[0],
        },
      ]);
      toast.success("Đã chia sẻ bài đăng!");
    } catch (error) {
      toast.error("Lỗi khi chia sẻ!");
    }
  };

  const handleBookmark = async (post) => {
    try {
      await bookmarkPost(post._id);
      if (bookmarks.some((b) => b._id === post._id)) {
        setBookmarks((prev) => prev.filter((b) => b._id !== post._id));
        toast.success("Đã xóa khỏi bookmark!");
      } else {
        setBookmarks((prev) => [...prev, post]);
        toast.success("Đã thêm vào bookmark!");
      }
    } catch (error) {
      toast.error("Lỗi khi bookmark bài đăng!");
    }
  };

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      setWhoToFollow((prev) =>
        prev.map((person) =>
          person._id === userId ? { ...person, isFollowing: true } : person
        )
      );
      toast.success("Đã theo dõi!");
    } catch (err) {
      toast.error("Không thể theo dõi!");
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
      setWhoToFollow((prev) =>
        prev.map((person) =>
          person._id === userId ? { ...person, isFollowing: false } : person
        )
      );
      toast.success("Đã bỏ theo dõi!");
    } catch (err) {
      toast.error("Không thể bỏ theo dõi!");
    }
  };

  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
    setAiSearchResult(null);
  };

  const handleAISearch = async (useImage = false) => {
    if (!searchQuery && !useImage) {
      toast.error("Vui lòng nhập câu hỏi hoặc chọn hình ảnh!");
      return;
    }

    setAiLoading(true);
    setAiSearchResult(null);
    setSelectedExercise(null);

    try {
      if (useImage && imageSearchFile) {
        const mockResult = {
          content: "Kết quả từ hình ảnh: Đây là bài toán tích phân.",
          steps: ["Bước 1: Xác định hàm số.", "Bước 2: Tính đạo hàm."],
        };
        setAiSearchResult(mockResult);
      } else {
        const mockResult = {
          content: `Kết quả cho "${searchQuery}": Đây là giải pháp mẫu.`,
          steps: ["Bước 1: Phân tích đề bài.", "Bước 2: Áp dụng công thức."],
        };
        setAiSearchResult(mockResult);
      }
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm bằng AI!");
      setAiSearchResult({
        content: "Đã có lỗi xảy ra khi tìm kiếm.",
        steps: [],
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearch = async () => {
    setPage(1);
    setSelectedExercise(null);
    setAiSearchResult(null);

    try {
      const response = await getPosts({
        content: searchQuery,
        page,
        limit: postsPerPage,
        ...(activeTab === "exercise"
          ? { category: "question" }
          : { category_ne: "question" }),
      });
      if (activeTab === "study") {
        setSearchResults(Array.isArray(response.data) ? response.data : []);
      } else {
        setPosts(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm!");
      if (activeTab === "study") setSearchResults([]);
      else setPosts([]);
    }
  };

  const filteredExercises = Array.isArray(exercises)
    ? exercises.filter((exercise) => {
        const matchesGrade = gradeFilter
          ? exercise?.grade === gradeFilter
          : true;
        const matchesSubject = subjectFilter
          ? exercise?.subject === subjectFilter
          : true;
        const matchesStatus = statusFilter
          ? statusFilter === "solved"
            ? exercise.solved
            : !exercise.solved
          : true;
        const withinSixDays =
          (Date.now() - new Date(exercise.createdAt)) / (1000 * 60 * 60 * 24) <=
          6;
        return matchesGrade && matchesSubject && matchesStatus && withinSixDays;
      })
    : [];

  const filteredPosts = Array.isArray(posts)
    ? posts.filter((post) =>
        post?.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredSearchResults = Array.isArray(searchResults)
    ? searchResults.filter((result) =>
        result?.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (loading) {
    return <div className="loading-spinner">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="study-corner-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!user) {
    return <div>Vui lòng đăng nhập để tiếp tục.</div>;
  }

  const defaultAvatar = "/default-avatar.png";

  return (
    <div className="study-corner-page">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        user={user}
        tabs="study"
      />
      <div className="main-content">
        {activeTab === "exercise" && (
          <div className="exercise-tab">
            <div className="exercise-left">
              <div className="filters">
                <div className="grade-filter">
                  <select
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                  >
                    <option value="">Tất cả lớp</option>
                    {[...Array(12)].map((_, index) => (
                      <option key={index + 1} value={`Lớp ${index + 1}`}>
                        Lớp {index + 1}
                      </option>
                    ))}
                    <option value="Đại học">Đại học</option>
                  </select>
                </div>
                <div className="subject-filter">
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                  >
                    <option value="">Tất cả môn</option>
                    {gradeFilter === "Đại học" ? (
                      <>
                        <option value="Toán cao cấp">Toán cao cấp</option>
                        <option value="Giải tích">Giải tích</option>
                        <option value="Đại số">Đại số</option>
                        <option value="Xác suất thống kê">
                          Xác suất thống kê
                        </option>
                        <option value="Phương trình vi phân">
                          Phương trình vi phân
                        </option>
                      </>
                    ) : (
                      <>
                        <option value="Toán">Toán</option>
                        <option value="Văn">Văn</option>
                        <option value="Anh">Anh</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="status-filter">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="solved">Đã giải</option>
                    <option value="pending">Đang chờ</option>
                  </select>
                </div>
                <button
                  className="post-question-btn"
                  data-tooltip-id="post-question"
                  data-tooltip-content="Đăng câu hỏi mới"
                  onClick={() => setShowPostForm(true)}
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
                <Tooltip
                  id="post-question"
                  place="top"
                  style={{ zIndex: 1000 }}
                />
              </div>
              {showPostForm && (
                <div className="post-form">
                  <h3>Đăng câu hỏi mới</h3>
                  <input
                    type="text"
                    placeholder="Tiêu đề câu hỏi..."
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                  />
                  <textarea
                    placeholder="Nội dung câu hỏi..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  <div className="post-actions">
                    <label htmlFor="file-upload-exercise">
                      <i className="fa-solid fa-paperclip"></i> Đính kèm
                    </label>
                    <input
                      id="file-upload-exercise"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                    <button onClick={handlePostSubmit}>Gửi</button>
                    <button
                      onClick={() => setShowPostForm(false)}
                      className="cancel-btn"
                    >
                      Hủy
                    </button>
                  </div>
                  {newPostAttachments.length > 0 && (
                    <div className="post-attachments">
                      {newPostAttachments.map((attachment, index) => (
                        <img
                          key={index}
                          src={URL.createObjectURL(attachment)}
                          alt="Attachment"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="exercise-list">
                <h3>Câu hỏi mới nhất (6 ngày gần đây)</h3>
                {filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                    <div
                      key={exercise._id}
                      className={`exercise-item ${
                        selectedExercise?._id === exercise._id ? "selected" : ""
                      }`}
                      onClick={() => handleSelectExercise(exercise)}
                    >
                      <h4>{exercise.title || "Không có tiêu đề"}</h4>
                      <p>Lớp: {exercise.grade || "N/A"}</p>
                      <p>Môn: {exercise.subject || "N/A"}</p>
                      <p>
                        Trạng thái: {exercise.solved ? "Đã giải" : "Đang chờ"}
                      </p>
                      <p>{exercise.content || "Không có nội dung"}</p>
                      <p>Đăng bởi: {exercise.author?.username || "Ẩn danh"}</p>
                      <div className="post-actions">
                        <button onClick={() => handleLike(exercise._id)}>
                          <i className="fa-solid fa-heart"></i>{" "}
                          {exercise.likes?.length || 0}
                        </button>
                        <button onClick={() => handleBookmark(exercise)}>
                          <i
                            className={`fa-solid fa-bookmark ${
                              bookmarks.some((b) => b._id === exercise._id)
                                ? "bookmarked"
                                : ""
                            }`}
                          ></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Không tìm thấy câu hỏi nào.</p>
                )}
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Trang trước
                  </button>
                  <span>Trang {page}</span>
                  <button
                    disabled={filteredExercises.length < postsPerPage}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            </div>
            <div className="exercise-right">
              {selectedExercise ? (
                <div className="solution-box">
                  <h3>Chi tiết câu hỏi</h3>
                  <h4>{selectedExercise.title || "Không có tiêu đề"}</h4>
                  <p>
                    <strong>Nội dung:</strong>{" "}
                    {selectedExercise.content || "Không có nội dung"}
                  </p>
                  <p>
                    <strong>Đăng bởi:</strong>{" "}
                    {selectedExercise.author?.username || "Ẩn danh"}
                  </p>
                  {selectedExercise.attachments?.length > 0 && (
                    <img
                      src={selectedExercise.attachments[0]}
                      alt="Attachment"
                      className="post-image"
                    />
                  )}
                  {selectedExercise.comments?.length > 0 && (
                    <div className="comments-section">
                      {selectedExercise.comments.map((comment, index) => (
                        <div key={index} className="comment-item">
                          <span className="comment-author">
                            {comment.user?.username || "Ẩn danh"}:
                          </span>
                          <span className="comment-content">
                            {comment.content}
                          </span>
                          <span className="comment-time">
                            {Math.floor(
                              (Date.now() - new Date(comment.createdAt)) /
                                (1000 * 60 * 60)
                            )}{" "}
                            giờ trước
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="comment-form">
                    <input
                      type="text"
                      placeholder="Viết bình luận..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleComment(selectedExercise._id)
                      }
                    />
                    <button onClick={() => handleComment(selectedExercise._id)}>
                      Gửi
                    </button>
                  </div>
                </div>
              ) : aiSearchResult ? (
                <div className="ai-result-box">
                  <h3>Kết quả tìm kiếm AI</h3>
                  {aiLoading ? (
                    <p>Đang xử lý...</p>
                  ) : (
                    <>
                      <p>{aiSearchResult.content}</p>
                      {aiSearchResult.steps.length > 0 && (
                        <ul>
                          {aiSearchResult.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p>Chọn một câu hỏi hoặc tìm kiếm để xem chi tiết.</p>
              )}
            </div>
          </div>
        )}
        {activeTab === "study" && (
          <div className="study-tab">
            <div className="study-left">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết hoặc câu hỏi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  className="search-btn"
                  data-tooltip-id="keyword-search"
                  data-tooltip-content="Tìm kiếm bằng từ khóa"
                  onClick={handleSearch}
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
                <label
                  htmlFor="image-search-upload"
                  className="image-search-btn"
                  data-tooltip-id="image-search"
                  data-tooltip-content="Tìm kiếm bằng hình ảnh"
                >
                  <i className="fa-solid fa-camera"></i>
                </label>
                <input
                  id="image-search-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSearchUpload}
                  style={{ display: "none" }}
                />
                <button
                  className="ai-search-btn"
                  data-tooltip-id="ai-search"
                  data-tooltip-content="Tìm kiếm bằng AI"
                  onClick={() => handleAISearch(false)}
                >
                  <i className="fa-solid fa-robot"></i>
                </button>
                {imageSearchFile && (
                  <button
                    className="ai-image-search-btn"
                    data-tooltip-id="ai-image-search"
                    data-tooltip-content="Tìm kiếm bằng AI qua hình ảnh"
                    onClick={() => handleAISearch(true)}
                  >
                    <i className="fa-solid fa-robot"></i>
                    <i className="fa-solid fa-image"></i>
                  </button>
                )}
                <Tooltip
                  id="keyword-search"
                  place="top"
                  style={{ zIndex: 1000 }}
                />
                <Tooltip
                  id="image-search"
                  place="top"
                  style={{ zIndex: 1000 }}
                />
                <Tooltip id="ai-search" place="top" style={{ zIndex: 1000 }} />
                <Tooltip
                  id="ai-image-search"
                  place="top"
                  style={{ zIndex: 1000 }}
                />
              </div>
              <div className="search-results">
                <h3>Kết quả tìm kiếm</h3>
                {aiSearchResult ? (
                  <div className="ai-result-box">
                    <h4>Kết quả tìm kiếm AI</h4>
                    {aiLoading ? (
                      <p>Đang xử lý...</p>
                    ) : (
                      <>
                        <p>{aiSearchResult.content}</p>
                        {aiSearchResult.steps.length > 0 && (
                          <ul>
                            {aiSearchResult.steps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                ) : filteredSearchResults.length > 0 ? (
                  filteredSearchResults.map((result) => (
                    <div
                      key={result._id}
                      className={`exercise-item ${
                        selectedExercise?._id === result._id ? "selected" : ""
                      }`}
                      onClick={() => handleSelectExercise(result)}
                    >
                      <h4>{result.title || "Không có tiêu đề"}</h4>
                      <p>{result.content || "Không có nội dung"}</p>
                      <p>Đăng bởi: {result.author?.username || "Ẩn danh"}</p>
                      <div className="post-actions">
                        <button onClick={() => handleLike(result._id)}>
                          <i className="fa-solid fa-heart"></i>{" "}
                          {result.likes?.length || 0}
                        </button>
                        <button onClick={() => handleBookmark(result)}>
                          <i
                            className={`fa-solid fa-bookmark ${
                              bookmarks.some((b) => b._id === result._id)
                                ? "bookmarked"
                                : ""
                            }`}
                          ></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Không tìm thấy kết quả nào.</p>
                )}
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Trang trước
                  </button>
                  <span>Trang {page}</span>
                  <button
                    disabled={filteredSearchResults.length < postsPerPage}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            </div>
            <div className="study-right">
              <div className="trending-topics">
                <h3>Chủ đề nổi bật</h3>
                {trendingTopics.length > 0 ? (
                  trendingTopics.map((topic, index) => (
                    <div key={index} className="topic-item">
                      <span>{topic}</span>
                    </div>
                  ))
                ) : (
                  <p>Chưa có chủ đề nào.</p>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === "share" && (
          <div className="share-tab">
            <div className="share-left">
              <div className="post-form">
                <h3>Chia sẻ điều gì đó...</h3>
                <textarea
                  placeholder="Bạn đang nghĩ gì?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                <div className="post-actions">
                  <label htmlFor="file-upload-share">
                    <i className="fa-solid fa-paperclip"></i> Đính kèm
                  </label>
                  <input
                    id="file-upload-share"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <button onClick={handlePostSubmit}>Đăng</button>
                </div>
                {newPostAttachments.length > 0 && (
                  <div className="post-attachments">
                    {newPostAttachments.map((attachment, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(attachment)}
                        alt="Attachment"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="post-list">
                <h3>Bài đăng mới nhất</h3>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <div key={post._id} className="post-item">
                      <div className="post-header">
                        <img
                          src={post.author?.avatar || defaultAvatar}
                          alt="Avatar"
                          className="post-avatar"
                        />
                        <div>
                          <span className="post-author">
                            {post.author?.username || "Ẩn danh"}
                          </span>
                          <span className="post-time">
                            {Math.floor(
                              (Date.now() - new Date(post.createdAt)) /
                                (1000 * 60 * 60)
                            )}{" "}
                            giờ trước
                          </span>
                        </div>
                      </div>
                      <p>{post.content}</p>
                      {post.attachments?.length > 0 && (
                        <img
                          src={post.attachments[0]}
                          alt="Attachment"
                          className="post-image"
                        />
                      )}
                      <div className="post-actions">
                        <button onClick={() => handleLike(post._id)}>
                          <i className="fa-solid fa-heart"></i>{" "}
                          {post.likes?.length || 0}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedExercise(post);
                            setNewComment("");
                          }}
                        >
                          <i className="fa-solid fa-comment"></i>{" "}
                          {post.comments?.length || 0}
                        </button>
                        <button onClick={() => handleShare(post._id)}>
                          <i className="fa-solid fa-share"></i>{" "}
                          {post.shares || 0}
                        </button>
                        <button onClick={() => handleBookmark(post)}>
                          <i
                            className={`fa-solid fa-bookmark ${
                              bookmarks.some((b) => b._id === post._id)
                                ? "bookmarked"
                                : ""
                            }`}
                          ></i>
                        </button>
                      </div>
                      {selectedExercise?._id === post._id && (
                        <div className="comments-section">
                          {post.comments?.length > 0 &&
                            post.comments.map((comment, index) => (
                              <div key={index} className="comment-item">
                                <span className="comment-author">
                                  {comment.user?.username || "Ẩn danh"}:
                                </span>
                                <span className="comment-content">
                                  {comment.content}
                                </span>
                                <span className="comment-time">
                                  {Math.floor(
                                    (Date.now() - new Date(comment.createdAt)) /
                                      (1000 * 60 * 60)
                                  )}{" "}
                                  giờ trước
                                </span>
                              </div>
                            ))}
                          <div className="comment-form">
                            <input
                              type="text"
                              placeholder="Viết bình luận..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleComment(post._id)
                              }
                            />
                            <button onClick={() => handleComment(post._id)}>
                              Gửi
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p>Chưa có bài đăng nào.</p>
                )}
                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                  >
                    Trang trước
                  </button>
                  <span>Trang {page}</span>
                  <button
                    disabled={filteredPosts.length < postsPerPage}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            </div>
            <div className="share-right">
              <div className="who-to-follow">
                <h3>Gợi ý theo dõi</h3>
                {whoToFollow.length > 0 ? (
                  whoToFollow.map((person) => (
                    <div key={person._id} className="follow-item">
                      <img
                        src={person.avatar || defaultAvatar}
                        alt="Avatar"
                        className="follow-avatar"
                      />
                      <div>
                        <span className="follow-username">
                          {person.username}
                        </span>
                        <span className="follow-bio">
                          {person.bio || "Chưa có bio"}
                        </span>
                      </div>
                      {person.isFollowing ? (
                        <button
                          className="unfollow-btn"
                          onClick={() => handleUnfollow(person._id)}
                        >
                          Bỏ theo dõi
                        </button>
                      ) : (
                        <button
                          className="follow-btn"
                          onClick={() => handleFollow(person._id)}
                        >
                          Theo dõi
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p>Chưa có gợi ý nào.</p>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === "bookmarks" && (
          <div className="bookmarks-tab">
            <h3>Bookmarks</h3>
            {bookmarks.length > 0 ? (
              bookmarks.map((bookmark) => (
                <div key={bookmark._id} className="bookmark-item">
                  <h4>
                    {bookmark.title || bookmark.content.slice(0, 50) + "..."}
                  </h4>
                  <p>
                    <strong>Loại:</strong>{" "}
                    {bookmark.category === "question" ? "Câu hỏi" : "Bài đăng"}
                  </p>
                  <p>
                    <strong>Đăng bởi:</strong>{" "}
                    {bookmark.author?.username || "Ẩn danh"}
                  </p>
                  <div className="post-actions">
                    <button onClick={() => handleLike(bookmark._id)}>
                      <i className="fa-solid fa-heart"></i>{" "}
                      {bookmark.likes?.length || 0}
                    </button>
                    <button onClick={() => handleBookmark(bookmark)}>
                      <i className="fa-solid fa-bookmark bookmarked"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Chưa có bài đăng nào được bookmark.</p>
            )}
          </div>
        )}
        {activeTab === "notifications" && (
          <div className="notifications-tab">
            <h3>Thông báo</h3>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <p>{notification.message}</p>
                  <span>{notification.date}</span>
                </div>
              ))
            ) : (
              <p>Chưa có thông báo nào.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyCorner;
