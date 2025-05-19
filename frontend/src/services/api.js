import axios from "axios"
import { toast } from "react-toastify"

// Tạo một đối tượng để theo dõi các lỗi đã hiển thị
const displayedErrors = new Set()
// Thời gian tối thiểu giữa các thông báo lỗi (ms)
const ERROR_COOLDOWN = 5000
// Thời gian để xóa lỗi khỏi danh sách đã hiển thị (ms)
const ERROR_RESET_TIME = 10000

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
})

// Hàm để tạo mã hash đơn giản cho lỗi
const getErrorHash = (error) => {
  const { message, url, method } = error
  return `${message}-${url}-${method}`
}

// Hàm để kiểm tra và hiển thị lỗi nếu cần
const handleErrorDisplay = (error) => {
  const errorHash = getErrorHash(error)

  // Nếu lỗi này chưa được hiển thị gần đây
  if (!displayedErrors.has(errorHash)) {
    displayedErrors.add(errorHash)

    // Hiển thị thông báo lỗi
    if (error.response && error.response.data && error.response.data.message) {
      toast.error(error.response.data.message)
    } else if (error.message.includes("Network Error")) {
      toast.error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.")
    } else {
      toast.error(error.message)
    }

    // Xóa lỗi khỏi danh sách sau một khoảng thời gian
    setTimeout(() => {
      displayedErrors.delete(errorHash)
    }, ERROR_RESET_TIME)
  }
}

// Interceptor cho request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor cho response
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Tạo đối tượng lỗi với thông tin bổ sung
    const enhancedError = {
      ...error,
      message: error.message,
      url: error.config.url,
      method: error.config.method,
    }

    // Xử lý hiển thị lỗi
    handleErrorDisplay(enhancedError)

    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Kiểm tra nếu không phải là request đến endpoint đăng nhập
      if (!error.config.url.includes("/auth/login")) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        // Chỉ chuyển hướng nếu đang ở trang yêu cầu xác thực
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register" &&
          window.location.pathname !== "/forgot-password"
        ) {
          window.location.href = "/login"
        }
      }
    }

    return Promise.reject(error)
  },
)

export default api
