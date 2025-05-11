import api from "./api";

export const addBookmark = async (courseId) => {
  const response = await api.post("/bookmarks", { courseId });
  return response.data;
};

export const removeBookmark = async (courseId) => {
  const response = await api.delete(`/bookmarks/${courseId}`);
  return response.data;
};

export const getBookmarks = async () => {
  const response = await api.get("/bookmarks");
  return response.data;
};