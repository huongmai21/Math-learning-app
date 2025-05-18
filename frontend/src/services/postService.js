import api from "./api";

// Lấy tất cả bài đăng
export const getAllPosts = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

// Lấy bài đăng theo ID
export const getPostById = async (postId) => {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post with ID ${postId}:`, error);
    throw error;
  }
};

// Tạo bài đăng mới
export const createPost = async (postData) => {
  try {
    const response = await api.post("/posts", postData);
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Cập nhật bài đăng
export const updatePost = async (postId, postData) => {
  try {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
  } catch (error) {
    console.error(`Error updating post with ID ${postId}:`, error);
    throw error;
  }
};

// Xóa bài đăng
export const deletePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting post with ID ${postId}:`, error);
    throw error;
  }
};

// Thích bài đăng
export const likePost = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error(`Error liking post with ID ${postId}:`, error);
    throw error;
  }
};

// Bỏ thích bài đăng
export const unlikePost = async (postId) => {
  try {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error(`Error unliking post with ID ${postId}:`, error);
    throw error;
  }
};

// Lấy bài đăng theo danh mục
export const getPostsByCategory = async (category, page = 1, limit = 10) => {
  try {
    const response = await api.get(
      `/posts/category/${category}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts by category ${category}:`, error);
    throw error;
  }
};

// Lấy bài đăng theo người dùng
export const getPostsByUser = async (userId, page = 1, limit = 10) => {
  try {
    const response = await api.get(
      `/posts/user/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching posts by user ${userId}:`, error);
    throw error;
  }
};

// Tìm kiếm bài đăng
export const searchPosts = async (query, page = 1, limit = 10) => {
  try {
    const response = await api.get(
      `/posts/search?q=${query}&page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error searching posts with query ${query}:`, error);
    throw error;
  }
};

export default {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  getPostsByCategory,
  getPostsByUser,
  searchPosts,
};
