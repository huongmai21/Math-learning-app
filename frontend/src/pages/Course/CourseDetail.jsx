import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../../services/api";

const stripePromise = loadStripe("pk_test_51RMnRjP0vIjYfre3BW4vDGrhldqRHqGELCoyCL89JyXi17O5XRuoWsDtKg4zahuyfPpDuhGj4WL7kkeGjPUaCztE00ElIpqPt8"); 

const CheckoutForm = ({ courseId, price }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { data } = await api.post(
        `/courses/${courseId}/payment`,
        { amount: price },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { clientSecret } = data;
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        await api.post(
          `/courses/enroll`,
          { courseId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Thanh toán và đăng ký khóa học thành công!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Thanh toán thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#34495e",
              "::placeholder": { color: "#aab7c4" },
            },
            invalid: { color: "#e74c3c" },
          },
        }}
      />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-[#e74c3c] text-white py-2 rounded-full hover:bg-[#c0392b] disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Đang xử lý..." : `Thanh toán ${price.toLocaleString()} VND`}
      </button>
    </form>
  );
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState({ completedContents: [] });
  const [reviews, setReviews] = useState([]);
  const [newContent, setNewContent] = useState({ title: "", type: "video", url: "", isPreview: false });
  const [editingContent, setEditingContent] = useState(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(response.data.data);
        if (user?.enrolledCourses.includes(id)) {
          const progressRes = await api.get(`/courses/${id}/progress`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProgress(progressRes.data.data);
          // Check if course is completed
          if (
            progressRes.data.data.completedContents.length === response.data.data.contents.length &&
            !user.completedCourses.includes(id)
          ) {
            toast.success("Chúc mừng! Bạn đã hoàn thành khóa học!");
          }
        }
        const reviewsRes = await api.get(`/courses/${id}/reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(reviewsRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tải chi tiết khóa học!");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchCourse();
  }, [id, token, user]);

  const handleEnrollWithoutPayment = async () => {
    try {
      await api.post(
        `/courses/enroll`,
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Đăng ký khóa học thành công!");
      navigate(0); // Reload page to fetch progress
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại!");
    }
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `/courses/${id}/contents`,
        newContent,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourse(response.data.data);
      setNewContent({ title: "", type: "video", url: "", isPreview: false });
      toast.success("Thêm nội dung thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Thêm nội dung thất bại!");
    }
  };

  const handleUpdateContent = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(
        `/courses/${id}/contents/${editingContent._id}`,
        newContent,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCourse(response.data.data);
      setEditingContent(null);
      setNewContent({ title: "", type: "video", url: "", isPreview: false });
      toast.success("Cập nhật nội dung thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật nội dung thất bại!");
    }
  };

  const handleDeleteContent = async (contentId) => {
    try {
      const response = await api.delete(`/courses/${id}/contents/${contentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(response.data.data);
      toast.success("Xóa nội dung thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xóa nội dung thất bại!");
    }
  };

  const handleEditContent = (content) => {
    setEditingContent(content);
    setNewContent({
      title: content.title,
      type: content.type,
      url: content.url,
      isPreview: content.isPreview,
    });
  };

  const handleMarkComplete = async (contentId, completed) => {
    try {
      const response = await api.post(
        `/courses/${id}/progress`,
        { contentId, completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(response.data.data);
      toast.success(completed ? "Đánh dấu hoàn thành!" : "Bỏ đánh dấu hoàn thành!");
      // Check if course is completed
      if (response.data.data.completedContents.length === course.contents.length) {
        toast.success("Chúc mừng! Bạn đã hoàn thành khóa học!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật tiến độ thất bại!");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        `/courses/${id}/reviews`,
        newReview,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews([...reviews, response.data.data]);
      setNewReview({ rating: 5, comment: "" });
      toast.success("Gửi đánh giá thành công!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi đánh giá thất bại!");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!course) {
    return <div className="text-center py-10">Khóa học không tồn tại.</div>;
  }

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#f5f5f5] p-5">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-[#34495e] mb-4">{course.title}</h2>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <p className="text-gray-500 mb-2">Giá: {course.price.toLocaleString()} VND</p>
        <p className="text-gray-500 mb-4">
          Giảng viên: {course.instructorId?.username || "N/A"}
        </p>
        {user?.role === "student" && !user.enrolledCourses.includes(id) && (
          <div className="mt-6">
            {course.price > 0 ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm courseId={course._id} price={course.price} />
              </Elements>
            ) : (
              <button
                onClick={handleEnrollWithoutPayment}
                className="w-full bg-[#e74c3c] text-white py-2 rounded-full hover:bg-[#c0392b]"
              >
                Đăng ký miễn phí
              </button>
            )}
          </div>
        )}
        {(user?.role === "teacher" || user?.role === "admin") && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-[#34495e] mb-4">
              {editingContent ? "Chỉnh sửa nội dung" : "Thêm nội dung"}
            </h3>
            <form
              onSubmit={editingContent ? handleUpdateContent : handleAddContent}
              className="space-y-4 mb-6"
            >
              <div>
                <label className="block text-sm text-[#34495e]">Tiêu đề</label>
                <input
                  type="text"
                  value={newContent.title}
                  onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                  className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#34495e]">Loại</label>
                <select
                  value={newContent.type}
                  onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                  className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                >
                  <option value="video">Video</option>
                  <option value="document">Tài liệu</option>
                  <option value="quiz">Bài kiểm tra</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#34495e]">URL</label>
                <input
                  type="url"
                  value={newContent.url}
                  onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                  className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                  required
                />
              </div>
              <div>
                <label className="flex items-center text-sm text-[#34495e]">
                  <input
                    type="checkbox"
                    checked={newContent.isPreview}
                    onChange={(e) => setNewContent({ ...newContent, isPreview: e.target.checked })}
                    className="mr-2"
                  />
                  Cho phép xem trước
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-[#e74c3c] text-white py-2 rounded-full hover:bg-[#c0392b]"
              >
                {editingContent ? "Cập nhật nội dung" : "Thêm nội dung"}
              </button>
              {editingContent && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingContent(null);
                    setNewContent({ title: "", type: "video", url: "", isPreview: false });
                  }}
                  className="w-full bg-gray-300 text-[#34495e] py-2 rounded-full hover:bg-gray-400 mt-2"
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </form>
          </div>
        )}
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-[#34495e] mb-4">Nội dung khóa học</h3>
          {course.contents?.length > 0 ? (
            <ul className="space-y-2">
              {course.contents.map((content) => (
                <li
                  key={content._id}
                  className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
                >
                  <div>
                    {(user?.enrolledCourses.includes(id) || content.isPreview) ? (
                      <a
                        href={content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#34495e] hover:underline"
                      >
                        {content.title} ({content.type === "video" ? "Video" : content.type === "document" ? "Tài liệu" : "Bài kiểm tra"})
                        {content.isPreview && <span className="ml-2 text-sm text-green-500">(Xem trước)</span>}
                      </a>
                    ) : (
                      <span className="text-gray-500">
                        {content.title} ({content.type === "video" ? "Video" : content.type === "document" ? "Tài liệu" : "Bài kiểm tra"}) - Đăng ký để xem
                      </span>
                    )}
                    {user?.enrolledCourses.includes(id) && (
                      <button
                        onClick={() =>
                          handleMarkComplete(content._id, !progress.completedContents.includes(content._id))
                        }
                        className={`ml-4 text-sm ${
                          progress.completedContents.includes(content._id)
                            ? "text-green-500"
                            : "text-gray-500"
                        } hover:underline`}
                      >
                        {progress.completedContents.includes(content._id)
                          ? "Đã hoàn thành"
                          : "Đánh dấu hoàn thành"}
                      </button>
                    )}
                  </div>
                  {(user?.role === "teacher" || user?.role === "admin") && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditContent(content)}
                        className="text-[#e74c3c] hover:underline"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content._id)}
                        className="text-red-500 hover:underline"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Chưa có nội dung nào.</p>
          )}
        </div>
        {user?.enrolledCourses.includes(id) && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-[#34495e] mb-4">Tiến độ học</h3>
            <p className="text-gray-500">
              Hoàn thành: {progress.completedContents.length} / {course.contents.length} nội dung (
              {((progress.completedContents.length / course.contents.length) * 100).toFixed(2)}%)
            </p>
            {user.completedCourses.includes(id) && (
              <p className="text-green-500 font-semibold mt-2">
                Bạn đã hoàn thành khóa học này!
              </p>
            )}
          </div>
        )}
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-[#34495e] mb-4">Đánh giá khóa học</h3>
          {user?.enrolledCourses.includes(id) && (
            <form onSubmit={handleSubmitReview} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-[#34495e]">Số sao</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <option key={star} value={star}>
                      {star} sao
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#34495e]">Bình luận</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e74c3c]"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#e74c3c] text-white py-2 rounded-full hover:bg-[#c0392b]"
              >
                Gửi đánh giá
              </button>
            </form>
          )}
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-[#34495e] font-semibold">
                    {review.userId?.username || "Ẩn danh"} - {review.rating} sao
                  </p>
                  <p className="text-gray-600">{review.comment}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Chưa có đánh giá nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;