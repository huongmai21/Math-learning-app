// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReCAPTCHA from "react-google-recaptcha";
import { forgotPassword } from "../../services/authService";
import "./LogReg.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    "g-recaptcha-response": "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onCaptchaChange = (value) => {
    setFormData((prevData) => ({ ...prevData, "g-recaptcha-response": value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData["g-recaptcha-response"]) {
      toast.error("Vui lòng xác nhận CAPTCHA!");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({
        email: formData.email,
        "g-recaptcha-response": formData["g-recaptcha-response"],
      });
      toast.success("Email reset đã được gửi!");
      navigate("/auth/login");
    } catch (err) {
      toast.error(err.message || "Gửi email thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="background"></div>
      <div className="container">
        <div className="content">
          <h2 className="logo">
            <i className="fa-solid fa-bahai"></i> FunMath
          </h2>
          <div className="text-sci">
            <h2>
              Forgot Password?
              <br />
              <span>Đừng lo, chúng tôi sẽ giúp bạn!</span>
            </h2>
            <p>Nhập email để nhận link đặt lại mật khẩu.</p>
          </div>
        </div>

        <div className="logreg-box">
          <div className="form-box login active">
            <form onSubmit={handleSubmit}>
              <h2>Reset Password</h2>
              <div className="input-box">
                <span className="icon">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="g-recaptcha">
                <ReCAPTCHA
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} // Sửa ở đây
                  onChange={onCaptchaChange}
                />
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Đang gửi..." : "Send Reset Link"}
              </button>
              <div className="login-register">
                <p>
                  Back to{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/auth/login")}
                    disabled={loading}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;