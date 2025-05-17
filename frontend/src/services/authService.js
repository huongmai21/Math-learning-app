import api from "./api"

// Đăng nhập
export const login = async (credentials) => {
  try {
    console.log("Đang gửi yêu cầu đăng nhập:", credentials)
    const response = await api.post("/auth/login", credentials)
    console.log("Phản hồi đăng nhập:", response.data)
    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      // Lấy thông tin người dùng sau khi đăng nhập thành công
      await refreshUser()
    }
    return response.data
  } catch (error) {
    console.error("Lỗi đăng nhập:", error)
    throw error.response?.data || { message: "Đăng nhập thất bại. Vui lòng kiểm tra kết nối mạng." }
  }
}

// Đăng ký
export const register = async (userData) => {
  try {
    console.log("Đang gửi yêu cầu đăng ký:", userData)
    const response = await api.post("/auth/register", userData)
    console.log("Phản hồi đăng ký:", response.data)
    if (response.data.token) {
      localStorage.setItem("token", response.data.token)
      // Lấy thông tin người dùng sau khi đăng ký thành công
      await refreshUser()
    }
    return response.data
  } catch (error) {
    console.error("Lỗi đăng ký:", error)
    throw error.response?.data || { message: "Đăng ký thất bại. Vui lòng kiểm tra kết nối mạng." }
  }
}

// Lấy thông tin người dùng hiện tại
export const refreshUser = async () => {
  try {
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("Không tìm thấy token")
    }

    const response = await api.get("/auth/me")
    console.log("Thông tin người dùng:", response.data)

    // Lưu thông tin người dùng vào localStorage
    if (response.data.data) {
      localStorage.setItem("user", JSON.stringify(response.data.data))
    }

    return response.data
  } catch (error) {
    console.error("refreshUser error:", error)
    // Nếu lỗi 401, xóa token và user
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
    throw error.response?.data || { message: "Không thể lấy thông tin người dùng" }
  }
}

// Quên mật khẩu
export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password", { email })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể gửi email đặt lại mật khẩu" }
  }
}

// Đặt lại mật khẩu
export const resetPassword = async (token, password) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}`, { password })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể đặt lại mật khẩu" }
  }
}

// Lấy thông tin người dùng từ localStorage
export const getStoredUser = () => {
  const token = localStorage.getItem("token")
  const user = localStorage.getItem("user")
  return {
    token,
    user: user ? JSON.parse(user) : null,
  }
}

// Đăng xuất
export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}
