import api from "./api";

const retryRequest = async (fn, retries = 2, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fn();
      return response.data; // Đảm bảo trả về dữ liệu từ API
    } catch (err) {
      if (i === retries - 1)
        throw new Error(
          `Request failed after ${retries} retries: ${err.message}`
        );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export const fetchDocuments = async (filters) => {
  return await retryRequest(() => api.get("/documents", { params: filters }));
};

export const fetchPopularDocuments = async (params) => {
  return await retryRequest(() => api.get("/documents/popular", { params }));
};

export const searchDocuments = async (filters) => {
  return await retryRequest(() =>
    api.get("/documents/search", { params: filters })
  );
};

export const getDocumentById = async (id) => {
  const response = await retryRequest(() => api.get(`/documents/${id}`));
  return response.data || {}; // Đảm bảo luôn có dữ liệu trả về
};

export const fetchRelatedDocuments = async ({
  educationLevel,
  subject,
  excludeId,
}) => {
  return await retryRequest(() =>
    api.get("/documents/related", {
      params: { educationLevel, subject, excludeId },
    })
  );
};

export const downloadDocument = async (id) => {
  return await retryRequest(() => api.get(`/documents/${id}/download`));
};

export const convertDocumentFormat = async (id, format) => {
  if (!["html", "markdown"].includes(format)) {
    throw new Error(
      "Unsupported format. Only 'html' and 'markdown' are supported."
    );
  }
  return await retryRequest(() =>
    api.get(`/documents/${id}/convert?format=${format}`, {
      responseType: "blob",
    })
  );
};

export const createDocument = async (data) => {
  return await retryRequest(() =>
    api.post("/documents", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  );
};

export const addBookmark = async (data) => {
  return await retryRequest(() => api.post("/bookmarks", data));
};

export const removeBookmark = async (id) => {
  return await retryRequest(() => api.delete(`/bookmarks/${id}`));
};

export const checkBookmark = async (id) => {
  const response = await retryRequest(() => api.get(`/bookmarks/${id}`));
  return response || { isBookmarked: false }; // Đảm bảo luôn có giá trị trả về
};

export const getBookmarks = async () => {
  return await retryRequest(() => api.get("/bookmarks"));
};
