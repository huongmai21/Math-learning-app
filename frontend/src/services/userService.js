import api from "./api";

export const getUserProfile = async (year) => {
  const response = await api.get(
    `/users/profile${year ? `?year=${year}` : ""}`
  );
  return response.data;
};

export const getProfile = async () => {
  try {
    const response = await api.get("/users/profile");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể tải dữ liệu người dùng!"
    );
  }
};

export const updateProfile = async (data) => {
  const response = await api.put("/users/profile", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const followUser = async (userId) => {
  const response = await api.put(`/users/${userId}/follow`);
  return response.data;
};

export const unfollowUser = async (userId) => {
  const response = await api.put(`/users/${userId}/unfollow`);
  return response.data;
};

export const getFollowers = async () => {
  const response = await api.get("/users/followers");
  return response.data;
};

export const getFollowing = async () => {
  const response = await api.get("/users/following");
  return response.data;
};

export const getUserSuggestions = async () => {
  const response = await api.get("/users/suggestions");
  return response.data;
};

export const getContributions = async (year) => {
  try {
    const response = await api.get(
      `/users/activity${year ? `?year=${year}` : ""}`
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể tải dữ liệu hoạt động!"
    );
  }
};

export const getScores = async () => {
  try {
    const response = await api.get("/users/scores");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể tải dữ liệu điểm số!"
    );
  }
};

export const getLibrary = async () => {
  try {
    const response = await api.get("/users/library");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể tải dữ liệu thư viện!"
    );
  }
};

export const getPosts = async () => {
  try {
    const response = await api.get("/users/posts");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Không thể tải dữ liệu bài đăng!"
    );
  }
};

export const getEnrolledCourses = async () => {
  try {
    const response = await api.get("/users/enrolled-courses");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Không thể tải dữ liệu khóa học đã đăng ký!"
    );
  }
};

export const getCompletedCourses = async () => {
  try {
    const response = await api.get("/users/completed-courses");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Không thể tải dữ liệu khóa học đã hoàn thành!"
    );
  }
};
