import api from "./api"

// Quản lý người dùng
export const getUsers = async () => {
  return await api.get("/admin/users")
}

export const deleteUser = async (userId) => {
  return await api.delete(`/admin/users/${userId}`)
}

export const updateUserRole = async (userId, role) => {
  return await api.put(`/admin/users/${userId}/role`, { role })
}

// Quản lý khóa học
export const getCourses = async () => {
  return await api.get("/admin/courses")
}

export const approveCourse = async (courseId) => {
  return await api.put(`/admin/courses/${courseId}/approve`)
}

export const rejectCourse = async (courseId) => {
  return await api.put(`/admin/courses/${courseId}/reject`)
}

export const deleteCourse = async (courseId) => {
  return await api.delete(`/admin/courses/${courseId}`)
}

// Quản lý đề thi
export const getExams = async () => {
  return await api.get("/admin/exams")
}

export const approveExam = async (examId) => {
  return await api.put(`/admin/exams/${examId}/approve`)
}

export const rejectExam = async (examId) => {
  return await api.put(`/admin/exams/${examId}/reject`)
}

export const deleteExam = async (examId) => {
  return await api.delete(`/admin/exams/${examId}`)
}

// Quản lý tin tức
export const getNews = async () => {
  return await api.get("/admin/news")
}

export const approveNews = async (newsId) => {
  return await api.put(`/admin/news/${newsId}/approve`)
}

export const rejectNews = async (newsId) => {
  return await api.put(`/admin/news/${newsId}/reject`)
}

export const deleteNews = async (newsId) => {
  return await api.delete(`/admin/news/${newsId}`)
}

// Quản lý tài liệu
export const getDocuments = async () => {
  return await api.get("/admin/documents")
}

export const approveDocument = async (documentId) => {
  return await api.put(`/admin/documents/${documentId}/approve`)
}

export const rejectDocument = async (documentId) => {
  return await api.put(`/admin/documents/${documentId}/reject`)
}

export const deleteDocument = async (documentId) => {
  return await api.delete(`/admin/documents/${documentId}`)
}

// Quản lý thư viện
export const getBookmarks = async () => {
  return await api.get("/admin/library")
}

export const deleteBookmark = async (bookmarkId) => {
  return await api.delete(`/admin/library/${bookmarkId}`)
}

// Thống kê
export const getStats = async () => {
  return await api.get("/admin/stats")
}

// Thống kê chi tiết
export const getDetailedStats = async (period) => {
  return await api.get(`/admin/stats/detailed?period=${period}`)
}
