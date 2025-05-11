import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("Token sent in request:", token); // Debug
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/auth/login" &&
      error.config.url !== "/auth/me"
    ) {
      localStorage.removeItem("token");
      window.location.href =
        "/auth/login?redirect=" + encodeURIComponent(window.location.pathname);
    }
    return Promise.reject(
      error.response?.data?.message || "Lỗi không xác định"
    );
  }
);

export default api;
