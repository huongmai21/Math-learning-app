// frontend/src/services/authService.js
import api from "./api";

export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Đăng ký thất bại");
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    const { token } = response.data;
    console.log("Token received:", token); // Debug
    localStorage.setItem("token", token);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
  }
};

export const refreshUser = async () => {
  try {
    const response = await api.get("/auth/me");
    console.log("Refresh user response:", response.data); // Debug
    return response.data;
  } catch (error) {
    console.error("Refresh user error:", error.response?.data); // Debug
    throw new Error(
      error.response?.data?.message || "Không thể lấy thông tin user"
    );
  }
};

export const forgotPassword = async (data) => {
  try {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Gửi yêu cầu reset password thất bại"
    );
  }
};

export const resetPassword = async (token, { password }) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Đặt lại mật khẩu thất bại"
    );
  }
};

// // Đăng xuất
// export const logout = () => {
//   localStorage.removeItem('token');
//   localStorage.removeItem('user');
// };