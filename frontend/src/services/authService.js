import api from "./api";
import { initSocket } from "./notificationService"; // Import initSocket từ notificationService

const retryRequest = async (request, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await request();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const register = async (userData) => {
  try {
    const response = await retryRequest(() =>
      api.post("/auth/register", userData)
    );
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    throw new Error(error.response?.data?.message || "Đăng ký thất bại");
  }
};

export const login = async (credentials) => {
  try {
    const response = await retryRequest(() => api.post("/auth/login", credentials));
    localStorage.setItem("token", response.data.token); // Đảm bảo lưu token
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
  }
};

export const refreshUser = async () => {
  try {
    const response = await retryRequest(() => api.get("/auth/me"));
    return response.data;
  } catch (error) {
    console.error("Refresh user error:", error);
    throw new Error(error.response?.data?.message || "Không thể lấy thông tin người dùng");
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await retryRequest(() =>
      api.post("/auth/forgot-password", { email })
    );
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw new Error(error.response?.data?.message || "Không thể gửi email đặt lại mật khẩu");
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await retryRequest(() =>
      api.post(`/auth/reset-password/${token}`, { password })
    );
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw new Error(error.response?.data?.message || "Không thể đặt lại mật khẩu");
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await retryRequest(() =>
      api.put("/users/profile", userData)
    );
    return response.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw new Error(error.response?.data?.message || "Không thể cập nhật hồ sơ");
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await retryRequest(() =>
      api.put("/users/change-password", passwordData)
    );
    return response.data;
  } catch (error) {
    console.error("Change password error:", error);
    throw new Error(error.response?.data?.message || "Không thể thay đổi mật khẩu");
  }
};

export const refreshToken = async () => {
  try {
    const response = await retryRequest(() =>
      api.post("/auth/refresh-token")
    );
    return response.data;
  } catch (error) {
    console.error("Refresh token error:", error);
    throw new Error(error.response?.data?.message || "Không thể làm mới token");
  }
};

export const logout = async () => {
  try {
    const response = await retryRequest(() => api.post("/auth/logout"));
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw new Error(error.response?.data?.message || "Đăng xuất thất bại");
  }
};

// Tự động làm mới token trước khi hết hạn
export const autoRefreshToken = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    const expiresAt = decoded.exp * 1000;
    const timeLeft = expiresAt - Date.now();
    if (timeLeft < 5 * 60 * 1000) { // Làm mới nếu còn dưới 5 phút
      const response = await refreshToken();
      localStorage.setItem("token", response.token);
    }
  } catch (error) {
    console.error("Auto refresh token error:", error);
  }
};

// Lắng nghe sự kiện đăng xuất từ Socket.IO
export const listenForLogout = (callback) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  const socket = initSocket(token);
  socket.on("logout", (data) => {
    callback(data);
  });
};