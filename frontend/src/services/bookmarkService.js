import api from "./api";

// Thêm bookmark
export const addBookmark = async (referenceType, referenceId) => {
  try {
    const response = await api.post("/bookmarks", { referenceType, referenceId });
    return response.data;
  } catch (error) {
    console.error(`Error adding bookmark for ${referenceType} with ID ${referenceId}:`, error);
    throw new Error(error.response?.data?.message || "Không thể thêm bookmark");
  }
};

// Xóa bookmark
export const removeBookmark = async (referenceType, referenceId) => {
  try {
    const response = await api.delete(`/bookmarks/${referenceType}/${referenceId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing bookmark for ${referenceType} with ID ${referenceId}:`, error);
    throw new Error(error.response?.data?.message || "Không thể xóa bookmark");
  }
};

// Lấy danh sách bookmark
export const getBookmarks = async (params = {}) => {
  try {
    const { page = 1, limit = 10, referenceType, search } = params;
    const query = new URLSearchParams({
      page,
      limit,
      ...(referenceType && { referenceType }),
      ...(search && { search }),
    }).toString();
    const response = await api.get(`/bookmarks?${query}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bookmarked items:", error);
    throw new Error(error.response?.data?.message || "Không thể lấy danh sách bookmark");
  }
};

// Kiểm tra trạng thái bookmark của nhiều tài nguyên
export const checkBookmarks = async (referenceType, referenceIds) => {
  try {
    const response = await api.post("/bookmarks/check", { referenceType, referenceIds });
    return response.data;
  } catch (error) {
    console.error(`Error checking bookmarks for ${referenceType}:`, error);
    throw new Error(error.response?.data?.message || "Không thể kiểm tra trạng thái bookmark");
  }
};

export default {
  addBookmark,
  removeBookmark,
  getBookmarks,
  checkBookmarks,
};