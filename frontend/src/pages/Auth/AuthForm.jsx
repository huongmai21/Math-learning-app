"use client";

// frontend/src/pages/Auth/AuthForm.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { refreshUser, login, clearError } from "../../redux/slices/authSlice";
import { register } from "../../services/authService";
import { toast } from "react-toastify";
import "./LogReg.css";

const AuthForm = () => {
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const pathname = location.pathname;
    setIsLogin(pathname === "/auth/login");
    dispatch(clearError());
    setErrors({ username: "", email: "", password: "" });
  }, [location.pathname, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      console.log("Đang gửi form:", isLogin ? "đăng nhập" : "đăng ký");
      console.log("Dữ liệu form:", formData);

      if (isLogin) {
        const result = await dispatch(
          login({
            email: formData.email,
            password: formData.password,
          })
        ).unwrap();
        console.log("Login result:", result);
        const token = localStorage.getItem("token"); // Kiểm tra token đã lưu
        if (token) {
          const refreshedUser = await dispatch(refreshUser()).unwrap();
          if (refreshedUser) {
            navigate("/users/profile", { replace: true }); // Chuyển ngay tới profile
          } else {
            toast.error(
              "Đăng nhập thất bại (không lấy được thông tin người dùng)"
            );
          }
        } else {
          toast.error("Token không được lưu, vui lòng thử lại");
        }
      } else {
        try {
          const response = await register({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          });
          toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
          navigate("/auth/login");
        } catch (error) {
          const responseData = error.response?.data;
          if (responseData && responseData.errors) {
            setErrors({
              username: responseData.errors.username || "",
              email: responseData.errors.email || "",
              password: responseData.errors.password || "",
            });
          } else {
            toast.error("Đăng ký thất bại, vui lòng kiểm tra lại thông tin");
          }
        }
      }
    } catch (error) {
      console.error("Lỗi xử lý form:", error);

      if (error.errors) {
        setErrors(error.errors);
      } else {
        setErrors({
          general: error.message || "Đã xảy ra lỗi. Vui lòng thử lại.",
        });
      }
    } finally {
      setIsLoading(false);
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
              <p>Welcome!</p>
              <br />
              <span>
                FunMath đang chờ bạn <br />
                khám phá đấy!
              </span>
            </h2>
            <p>
              Cùng khám phá niềm vui và đam mê <br />
              trong thế giới Toán học nào!
            </p>
            <div className="social-icons">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook-square"></i>
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>
        <div className={`logreg-box ${isLogin ? "" : "active"}`}>
          <div className={`form-box login ${isLogin ? "active" : ""}`}>
            <form onSubmit={handleSubmit}>
              <h2>Sign In</h2>
              {error && <p className="error">{error}</p>}
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
                {errors.email && <p className="error">{errors.email}</p>}
              </div>
              <div className="input-box">
                <span className="icon">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.password && <p className="error">{errors.password}</p>}
              </div>
              <div className="remember-forgot">
                <label>
                  <input type="checkbox" disabled={loading} /> Remember me
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                className="btn"
                disabled={loading || isLoading}
              >
                {loading || isLoading ? "Signing in..." : "Sign In"}
              </button>
              <div className="login-register">
                <p>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/auth/register")}
                    disabled={loading}
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          </div>
          <div className={`form-box register ${!isLogin ? "active" : ""}`}>
            <form onSubmit={handleSubmit}>
              <h2>Sign Up</h2>
              {error && <p className="error">{error}</p>}
              <div className="input-box">
                <span className="icon">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.username && <p className="error">{errors.username}</p>}
              </div>
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
                {errors.email && <p className="error">{errors.email}</p>}
              </div>
              <div className="input-box">
                <span className="icon">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                {errors.password && <p className="error">{errors.password}</p>}
              </div>
              <div className="input-box">
                <span className="icon">
                  <i className="fas fa-user-circle"></i>
                </span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div className="remember-forgot">
                <label>
                  <input type="checkbox" required disabled={loading} /> I agree
                  to the terms & conditions
                </label>
              </div>
              <button
                type="submit"
                className="btn"
                disabled={loading || isLoading}
              >
                {loading || isLoading ? "Signing up..." : "Sign Up"}
              </button>
              <div className="login-register">
                <p>
                  Already have an account?{" "}
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

export default AuthForm;
