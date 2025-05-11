import axios from "axios";

const API_URL = "/documents";

export const fetchDocuments = async (filters) => {
  const response = await axios.get(`${API_URL}`, { params: filters });
  return response.data;
};

export const fetchPopularDocuments = async (params) => {
  const response = await axios.get(`${API_URL}/popular`, { params });
  return response.data.documents;
};

export const searchDocuments = async (filters) => {
  const response = await axios.get(`${API_URL}/search`, { params: filters });
  return response.data;
};

export const getDocumentById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.document;
};

export const addBookmark = async (data) => {
  const response = await axios.post(`${API_URL}/bookmark`, data);
  return response.data;
};

export const removeBookmark = async (id) => {
  const response = await axios.delete(`${API_URL}/bookmark/${id}`);
  return response.data;
};

export const checkBookmark = async (id) => {
  const response = await axios.get(`${API_URL}/bookmark/${id}`);
  return response.data;
};

export const getUserBookmarks = async (params) => {
  const response = await axios.get(`${API_URL}/bookmarks`, { params });
  return response.data;
};

export const getDocumentStatistics = async () => {
  const response = await axios.get(`${API_URL}/statistics`);
  return response.data;
};

export const getDocumentReport = async (params) => {
  const response = await axios.get(`${API_URL}/report`, { params });
  return response.data;
};

export const createDocument = async (data) => {
  const response = await axios.post(`${API_URL}/create`, data);
  return response.data;
};
