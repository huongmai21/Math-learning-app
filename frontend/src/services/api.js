import axios from "axios"
import { toast } from "react-toastify"

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000"

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor để thêm token vào header của mỗi request
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

// Interceptor để xử lý lỗi response
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!")
      // Chuyển hướng đến trang đăng nhập nếu cần
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api
