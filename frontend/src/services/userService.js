import api from "./api";

export const getNews = async (limit) => {
  const response = await api.get(`/news?limit=${limit}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  return response.json();
};

export const getCourses = async (limit) => {
  const response = await api.get(`/courses?limit=${limit}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  return response.json();
};