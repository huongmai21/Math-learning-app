// src/components/AuthForm/AuthForm.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {refreshUser, login, clearError } from "../../redux/authSlice";

// import { login } from '../../services/authService';
// import { useAuth } from '../../hooks/useAuth';
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
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const pathname = location.pathname;
    setIsLogin(pathname === "/auth/login");
    dispatch(clearError());
  }, [location.pathname, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      try {
        await dispatch(login({ email: formData.email, password: formData.password })).unwrap();
        await dispatch(refreshUser()).unwrap(); // 👈 gọi lại để đảm bảo user được cập nhật chuẩn

        navigate("/");
      } catch (err) {
        // Error đã được xử lý trong slice
      }
    } else {
      try {
        const response = await fetch("http://localhost:3000/auth/register", {
          method: "POST",
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
          headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();
        if (response.ok) {
          navigate("/auth/login");
        } else {
          dispatch({ type: "auth/register/rejected", payload: result.message || "Có lỗi xảy ra!" });
        }
      } catch (error) {
        dispatch({ type: "auth/register/rejected", payload: "Lỗi kết nối đến server." });
      }
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
              Welcome!
              <br />
              <span>FunMath đang chờ bạn khám phá đấy!</span>
            </h2>
            <p>Cùng khám phá niềm vui và đam mê trong thế giới Toán học nào!</p>
            <div className="social-icons">
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-square"></i>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
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
                />
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
                />
              </div>
              <div className="remember-forgot">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <button type="button" onClick={() => alert("Chức năng quên mật khẩu chưa được triển khai!")}>
                  Forgot password?
                </button>
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Sign In"}
              </button>
              <div className="login-register">
                <p>
                  Don't have an account?{" "}
                  <button type="button" onClick={() => navigate("/auth/register")}>
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
                />
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
                />
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
                />
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
                  <input type="checkbox" /> I agree to the terms & conditions
                </label>
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? "Đang đăng ký..." : "Sign Up"}
              </button>
              <div className="login-register">
                <p>
                  Already have an account?{" "}
                  <button type="button" onClick={() => navigate("/auth/login")}>
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