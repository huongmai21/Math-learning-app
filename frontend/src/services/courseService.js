import api from "./api"

// Lấy tất cả khóa học
export const getAllCourses = async (params = {}) => {
  try {
    const response = await api.get("/courses", { params })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy danh sách khóa học")
  }
}

// Lấy khóa học theo ID
export const getCourseById = async (id) => {
  try {
    const response = await api.get(`/courses/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy thông tin khóa học")
  }
}

// Tạo khóa học mới
export const createCourse = async (courseData) => {
  try {
    const response = await api.post("/courses", courseData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tạo khóa học")
  }
}

// Cập nhật khóa học
export const updateCourse = async (id, courseData) => {
  try {
    const response = await api.put(`/courses/${id}`, courseData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể cập nhật khóa học")
  }
}

// Xóa khóa học
export const deleteCourse = async (id) => {
  try {
    const response = await api.delete(`/courses/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể xóa khóa học")
  }
}

// Lấy khóa học của tôi
export const getMyCourses = async () => {
  try {
    const response = await api.get("/courses/my-courses")
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy khóa học của bạn")
  }
}

// Đăng ký khóa học
export const enrollCourse = async (courseId) => {
  try {
    const response = await api.post(`/courses/${courseId}/enroll`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể đăng ký khóa học")
  }
}

// Hủy đăng ký khóa học
export const unenrollCourse = async (courseId) => {
  try {
    const response = await api.delete(`/courses/${courseId}/enroll`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể hủy đăng ký khóa học")
  }
}

// Tạo payment intent
export const createPaymentIntent = async (courseId, amount) => {
  try {
    const response = await api.post(`/courses/${courseId}/payment`, { amount })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tạo thanh toán")
  }
}

// Lấy bài học của khóa học
export const getCourseLessons = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/lessons`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy bài học")
  }
}

// Tạo bài học mới
export const createLesson = async (courseId, lessonData) => {
  try {
    const response = await api.post(`/courses/${courseId}/lessons`, lessonData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tạo bài học")
  }
}

// Cập nhật bài học
export const updateLesson = async (courseId, lessonId, lessonData) => {
  try {
    const response = await api.put(`/courses/${courseId}/lessons/${lessonId}`, lessonData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể cập nhật bài học")
  }
}

// Xóa bài học
export const deleteLesson = async (courseId, lessonId) => {
  try {
    const response = await api.delete(`/courses/${courseId}/lessons/${lessonId}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể xóa bài học")
  }
}

// Đánh giá khóa học
export const rateCourse = async (courseId, rating, comment) => {
  try {
    const response = await api.post(`/courses/${courseId}/reviews`, { rating, comment })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể đánh giá khóa học")
  }
}

// Lấy đánh giá của khóa học
export const getCourseReviews = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/reviews`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể lấy đánh giá khóa học")
  }
}

// Lấy khóa học để hiển thị trên trang Home
export const getCoursesPress = async (limit) => {
  const response = await api.get(`/courses?limit=${limit}&status=approved`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }
  return response.json()
}