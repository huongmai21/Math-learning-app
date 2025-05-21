import api from "./api"

// Lấy danh sách tin tức
export const getNews = async (page = 1, search = "", category = "") => {
  try {
    const response = await api.get("/news", {
      params: { page, search, category },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching news:", error)
    throw new Error(error.response?.data?.message || "Không thể tải tin tức")
  }
}

// Lấy chi tiết tin tức theo ID
export const getNewsById = async (id) => {
  try {
    const response = await api.get(`/news/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching news details:", error)
    throw new Error(error.response?.data?.message || "Không thể tải chi tiết tin tức")
  }
}

// Lấy gợi ý tin tức
export const getNewsSuggestions = async (query) => {
  try {
    const response = await api.get("/news/suggestions", {
      params: { query },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching news suggestions:", error)
    throw new Error(error.response?.data?.message || "Không thể tải gợi ý tin tức")
  }
}

// Lấy tin tức nổi bật cho trang chủ
export const getNewsPress = async ({ limit = 3 } = {}) => {
  try {
    const response = await api.get("/news/featured", {
      params: { limit },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching featured news:", error)
    // Trả về dữ liệu mẫu khi API lỗi để tránh crash UI
    return {
      success: true,
      news: [
        {
          _id: "sample1",
          title: "Tin tức Toán học mới nhất",
          summary: "Những phát triển mới nhất trong lĩnh vực Toán học và ứng dụng",
          image: "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934626/3_q1etwh.png",
          publishedAt: new Date().toISOString(),
          views: 100,
        },
        {
          _id: "sample2",
          title: "Kỳ thi Toán học quốc tế sắp diễn ra",
          summary: "Thông tin về kỳ thi Toán học quốc tế và cách chuẩn bị",
          image: "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png",
          publishedAt: new Date().toISOString(),
          views: 80,
        },
        {
          _id: "sample3",
          title: "Phương pháp học Toán hiệu quả",
          summary: "Các phương pháp giúp học Toán hiệu quả và nâng cao kết quả",
          image: "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934624/1_bsngjz.png",
          publishedAt: new Date().toISOString(),
          views: 50,
        },
      ],
    }
  }
}

// Cập nhật tin tức
export const updateNews = async (id, data) => {
  try {
    const response = await api.put(`/news/update/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating news:", error);
    throw new Error(error.response?.data?.message || "Không thể cập nhật tin tức");
  }
}