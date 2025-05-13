import api from "./api";

export const getCommentsByDocument = async (referenceId, params) => {
  const response = await api.get(`/comments/${referenceId}`, { params });
  return response.data;
};

export const createComment = async (data) => {
  const response = await api.post("/comments", data);
  return response.data.comment;
};

export const updateComment = async (id, data) => {
  const response = await api.put(`/comments/${id}`, data);
  return response.data.comment;
};

export const deleteComment = async (id) => {
  const response = await api.delete(`/comments/${id}`);
  return response.data;
};