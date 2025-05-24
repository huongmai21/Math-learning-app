import axios from "axios";
import { toast } from "react-toastify";
import { autoRefreshToken, refreshToken } from "./authService"; // Import từ authService

// Tạo một đối tượng để theo dõi các lỗi đã hiển thị
const displayedErrors = new Set();
// Thời gian tối thiểu giữa các thông báo lỗi (ms)
const ERROR_COOLDOWN = 5000;
// Thời gian để xóa lỗi khỏi danh sách đã hiển thị (ms)
const ERROR_RESET_TIME = 10000;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// Hàm để tạo mã hash đơn giản cho lỗi
const getErrorHash = (error) => {
  const { message, url, method } = error;
  return `${message}-${url}-${method}`;
};

// Hàm để kiểm tra và hiển thị lỗi nếu cần
const handleErrorDisplay = (error) => {
  const errorHash = getErrorHash(error);

  // Nếu lỗi này chưa được hiển thị gần đây
  if (!displayedErrors.has(errorHash)) {
    displayedErrors.add(errorHash);

    // Hiển thị thông báo lỗi
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message);
    } else if (error.message.includes("Network Error")) {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.");
    } else {
      toast.error(error.message);
    }

    // Xóa lỗi khỏi danh sách sau một khoảng thời gian
    setTimeout(() => {
      displayedErrors.delete(errorHash);
    }, ERROR_RESET_TIME);
  }
};

// Interceptor cho request
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");
    console.log("Token in request:", token); // Debug
    if (token) {
      await autoRefreshToken();
      config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("Response error:", error.response?.status, error.config.url); // Debug
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (!error.config.url.includes("/auth/login") && !error.config.url.includes("/auth/refresh-token")) {
        originalRequest._retry = true;
        try {
          const { token: newToken } = await refreshToken();
          console.log("New token:", newToken); // Debug
          localStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError); // Debug
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          if (
            window.location.pathname !== "/login" &&
            window.location.pathname !== "/register" &&
            window.location.pathname !== "/forgot-password"
          ) {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;