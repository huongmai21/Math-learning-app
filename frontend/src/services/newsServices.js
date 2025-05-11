import api from "./api";

export const getNews = async (params) => {
  const response = await api.get("/news", { params });
  return response.data;
};

export const getNewsById = async (id) => {
  const response = await api.get(`/news/${id}`);
  return response.data;
};

export const getNewsPress = async (limit) => {
  const response = await api.get(`/news?limit=${limit}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  return response.json();
};

// Đăng tin tức (cho admin)
export const postNews = async (newsData) => {
  try {
    const res = await api.post("/news", newsData);
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
      return;
    }
    if (err.response?.status === 403) {
      toast.error("Bạn không có quyền đăng tin tức!");
    } else if (err.response?.status === 400) {
      toast.error("Dữ liệu không hợp lệ, vui lòng kiểm tra lại!");
    } else {
      toast.error(err.response?.data?.message || "Không thể đăng tin tức!");
    }
    throw err;
  }
};