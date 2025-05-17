import api from "./api"

export const getNews = async (category, page = 1, limit = 10) => {
  try {
    const response = await api.get("/news", {
      params: { category, page, limit },
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải tin tức")
  }
}

export const getNewsById = async (id) => {
  try {
    const response = await api.get(`/news/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tải chi tiết tin tức")
  }
}

export const createNews = async (newsData) => {
  try {
    const response = await api.post("/news", newsData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể tạo tin tức")
  }
}

export const updateNews = async (id, newsData) => {
  try {
    const response = await api.put(`/news/${id}`, newsData)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể cập nhật tin tức")
  }
}

export const deleteNews = async (id) => {
  try {
    const response = await api.delete(`/news/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.message || "Không thể xóa tin tức")
  }
}

export const getNewsPress = async (limit) => {
  const response = await api.get(`/news?limit=${limit}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  return response.json();
};