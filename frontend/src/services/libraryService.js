import api from "./api"
import { toast } from "react-toastify"

export const getLibrary = async (page, limit) => {
  try {
    const res = await api.get("/library", {
      params: { page, limit },
    })
    return res.data
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!")
      setTimeout(() => (window.location.href = "/auth/login"), 2000)
    } else if (err.response?.status === 403) {
      toast.error("Bạn không có quyền truy cập thư viện tài liệu!")
    } else if (err.response?.status === 500) {
      toast.error("Lỗi server, vui lòng thử lại sau!")
    } else if (err.response?.status === 400) {
      toast.error("Yêu cầu không hợp lệ, vui lòng kiểm tra lại!")
    } else {
      toast.error(err.response?.data?.message || "Không thể tải danh sách tài liệu!")
    }
    throw err
  }
}

// Tải lên tài liệu
export const uploadDocument = async (formData) => {
  try {
    const res = await api.post("/library/upload", formData)
    return res.data
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!")
      setTimeout(() => (window.location.href = "/auth/login"), 2000)
      return
    }
    if (err.response?.status === 403) {
      toast.error("Bạn không có quyền tải lên tài liệu!")
    } else if (err.response?.status === 400) {
      toast.error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại!")
    } else {
      toast.error(err.response?.data?.message || "Không thể tải lên tài liệu!")
    }
    throw err
  }
}

// Xóa tài liệu
export const deleteDocument = async (docId) => {
  try {
    const res = await api.delete(`/library/${docId}`)
    return res.data
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!")
      setTimeout(() => (window.location.href = "/auth/login"), 2000)
      return
    }
    if (err.response?.status === 403) {
      toast.error("Bạn không có quyền xóa tài liệu này!")
    } else if (err.response?.status === 404) {
      toast.error("Tài liệu không tồn tại!")
    } else {
      toast.error(err.response?.data?.message || "Không thể xóa tài liệu!")
    }
    throw err
  }
}

// Chỉnh sửa tài liệu
export const editDocument = async (docId, data) => {
  try {
    const res = await api.put(`/library/${docId}`, data)
    return res.data
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!")
      setTimeout(() => (window.location.href = "/auth/login"), 2000)
      return
    }
    if (err.response?.status === 403) {
      toast.error("Bạn không có quyền chỉnh sửa tài liệu này!")
    } else if (err.response?.status === 404) {
      toast.error("Tài liệu không tồn tại!")
    } else if (err.response?.status === 400) {
      toast.error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại!")
    } else {
      toast.error(err.response?.data?.message || "Không thể chỉnh sửa tài liệu!")
    }
    throw err
  }
}
