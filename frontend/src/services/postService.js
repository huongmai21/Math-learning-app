import api from "./api"

// Lấy danh sách bài đăng
export const getPosts = async (params = {}) => {
  try {
    const response = await api.get("/posts", { params })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể lấy danh sách bài đăng" }
  }
}

// Lấy chi tiết bài đăng
export const getPostById = async (id) => {
  try {
    const response = await api.get(`/posts/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể lấy chi tiết bài đăng" }
  }
}

// Tạo bài đăng mới
export const createPost = async (postData) => {
  try {
    const response = await api.post("/posts", postData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể tạo bài đăng" }
  }
}

// Cập nhật bài đăng
export const updatePost = async (id, postData) => {
  try {
    const response = await api.put(`/posts/${id}`, postData)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể cập nhật bài đăng" }
  }
}

// Xóa bài đăng
export const deletePost = async (id) => {
  try {
    const response = await api.delete(`/posts/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể xóa bài đăng" }
  }
}

// Thích bài đăng
export const likePost = async (id) => {
  try {
    const response = await api.post(`/posts/${id}/like`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể thích bài đăng" }
  }
}

// Đánh dấu bài đăng
export const bookmarkPost = async (id) => {
  try {
    const response = await api.post(`/posts/${id}/bookmark`)
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể đánh dấu bài đăng" }
  }
}

// Lấy bài đăng đã đánh dấu
export const getBookmarkedPosts = async (params = {}) => {
  try {
    const response = await api.get("/posts/user/bookmarks", { params })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể lấy bài đăng đã đánh dấu" }
  }
}

// Lấy bài đăng phổ biến
export const getPopularPosts = async (params = {}) => {
  try {
    const response = await api.get("/posts/popular", { params })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể lấy bài đăng phổ biến" }
  }
}

// Tìm kiếm bài đăng
export const searchPosts = async (query, params = {}) => {
  try {
    const response = await api.get("/posts/search", {
      params: { q: query, ...params },
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể tìm kiếm bài đăng" }
  }
}

// Cập nhật trạng thái bài đăng
export const updatePostStatus = async (id, status) => {
  try {
    const response = await api.put(`/posts/${id}/status`, { status })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể cập nhật trạng thái bài đăng" }
  }
}

// Cập nhật câu trả lời AI
export const updateAiResponse = async (id, aiResponse) => {
  try {
    const response = await api.put(`/posts/${id}/ai-response`, { aiResponse })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể cập nhật câu trả lời AI" }
  }
}

// Upload ảnh
export const uploadPostImage = async (imageFile) => {
  try {
    const formData = new FormData()
    formData.append("image", imageFile)

    const response = await api.post("/posts/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể tải lên hình ảnh" }
  }
}

// Upload file
export const uploadPostFile = async (file) => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await api.post("/posts/upload/file", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    throw error.response?.data || { message: "Không thể tải lên file" }
  }
}
