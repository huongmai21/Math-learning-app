import api from "./api";

export const getCoursesPress = async (limit) => {
  const response = await api.get(`/courses?limit=${limit}&status=approved`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  return response.json();
};

export const getCourses = async (params) => {
  const response = await api.get("/courses", {
    params: { ...params, status: "approved" },
  });
  return response.data;
};

export const getCourseById = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const enrollCourse = async (courseId) => {
  const response = await api.post("/courses/enroll", { courseId });
  return response.data;
};

export const createPaymentIntent = async (courseId, amount) => {
  const response = await api.post(`/courses/${courseId}/payment`, { amount });
  return response.data;
};

export const addCourseContent = async (courseId, content) => {
  const response = await api.post(`/courses/${courseId}/contents`, content);
  return response.data;
};

export const updateCourseContent = async (courseId, contentId, content) => {
  const response = await api.put(
    `/courses/${courseId}/contents/${contentId}`,
    content
  );
  return response.data;
};

export const deleteCourseContent = async (courseId, contentId) => {
  const response = await api.delete(
    `/courses/${courseId}/contents/${contentId}`
  );
  return response.data;
};

export const updateProgress = async (courseId, contentId, completed) => {
  const response = await api.post(`/courses/${courseId}/progress`, {
    contentId,
    completed,
  });
  return response.data;
};

export const getProgress = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/progress`);
  return response.data;
};

export const createReview = async (courseId, review) => {
  const response = await api.post(`/courses/${courseId}/reviews`, review);
  return response.data;
};

export const getReviews = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/reviews`);
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await api.post("/courses", courseData);
  return response.data;
};

export const updateCourse = async (courseId, courseData) => {
  const response = await api.put(`/courses/${courseId}`, courseData);
  return response.data;
};

export const deleteCourse = async (courseId) => {
  const response = await api.delete(`/courses/${courseId}`);
  return response.data;
};
