import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { getCourseById, createPaymentIntent, enrollCourse } from "../../services/courseService";
import "./PaymentPage.css";

// Khởi tạo Stripe với public key
const stripePromise = loadStripe("your_stripe_publishable_key");

const CheckoutForm = ({ course, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe chưa sẵn sàng. Vui lòng thử lại!");
      setLoading(false);
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.username,
            email: user.email,
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        await enrollCourse(course._id);
        toast.success("Thanh toán thành công! Bạn đã đăng ký khóa học!");
        navigate(`/courses/${course._id}`);
      }
    } catch (err) {
      setError(err || "Thanh toán thất bại!");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="form-group">
        <label>Thông tin thẻ</label>
        <CardElement
          className="card-element"
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#333",
                "::placeholder": { color: "#999" },
              },
              invalid: { color: "#e74c3c" },
            },
          }}
        />
      </div>
      {error && <p className="error">{error}</p>}
      <button type="submit" className="pay-button" disabled={!stripe || loading}>
        {loading ? "Đang xử lý..." : `Thanh toán ${course.price.toLocaleString()} VND`}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để thanh toán!");
      navigate("/auth/login");
      return;
    }

    const fetchCourseAndPaymentIntent = async () => {
      setLoading(true);
      try {
        const courseResponse = await getCourseById(id);
        setCourse(courseResponse.data);
        const paymentResponse = await createPaymentIntent(id, courseResponse.data.price);
        setClientSecret(paymentResponse.clientSecret);
      } catch (err) {
        setError(err || "Không thể tải thông tin thanh toán!");
      } finally {
        setLoading(false);
      }
    };
    fetchCourseAndPaymentIntent();
  }, [id, user, token, navigate]);

  const handleImageError = (e) => {
    e.target.src = "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png";
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!course) {
    return <div className="no-results">Khóa học không tồn tại.</div>;
  }

  return (
    <div className="payment-page">
      <Helmet>
        <title>FunMath - Thanh toán khóa học</title>
        <meta name="description" content={`Thanh toán cho khóa học ${course.title}.`} />
      </Helmet>
      <div className="payment-container">
        <Link to={`/courses/${id}`} className="back-link">
          <i className="fas fa-arrow-left"></i> Quay lại khóa học
        </Link>
        <h2>Thanh toán khóa học</h2>
        <div className="course-info">
          <img
            src={course.thumbnail || "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png"}
            alt={course.title}
            className="course-thumbnail"
            onError={handleImageError}
          />
          <div className="course-details">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <p className="course-price">Giá: {course.price.toLocaleString()} VND</p>
            <p className="course-instructor">Giảng viên: {course.instructorId?.username || "N/A"}</p>
          </div>
        </div>
        <div className="payment-form-section">
          <h3>Thông tin thanh toán</h3>
          {clientSecret && (
            <Elements stripe={stripePromise}>
              <CheckoutForm course={course} clientSecret={clientSecret} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;