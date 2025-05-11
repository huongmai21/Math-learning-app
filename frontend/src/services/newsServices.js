import api from "./api";

export const getNews = async (params) => {
  const response = await api.get("/news", { params });
  return response.data;
};

export const getNewsById = async (id) => {
  const response = await api.get(`/news/${id}`);
  return response.data;
};