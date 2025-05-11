import api from "./api";

export const getPosts = async (params) => {
  const response = await api.get("/posts", { params });
  return response.data;
};

export const createPost = async (formData) => {
  const response = await api.post("/posts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const likePost = async (postId) => {
  const response = await api.put(`/posts/${postId}/like`);
  return response.data;
};

export const addComment = async (postId, content) => {
  const response = await api.put(`/posts/${postId}/comment`, { content });
  return response.data;
};

export const sharePost = async (postId) => {
  const response = await api.put(`/posts/${postId}/share`);
  return response.data;
};

export const bookmarkPost = async (postId) => {
  const response = await api.put(`/posts/${postId}/bookmark`);
  return response.data;
};
