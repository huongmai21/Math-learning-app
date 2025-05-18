import api from "./api";

// Hỏi câu hỏi toán học
export const askMathQuestion = async (question) => {
  try {
    const response = await api.post("/ai/math-question", { question });
    return response;
  } catch (error) {
    console.error("Error asking math question:", error);
    throw error;
  }
};

// Lấy lịch sử hỏi đáp
export const getMathHistory = async () => {
  try {
    const response = await api.get("/ai/history");
    return response;
  } catch (error) {
    console.error("Error getting math history:", error);
    throw error;
  }
};

// Tạo đề thi tự động
export const generateExam = async (params) => {
  try {
    const response = await api.post("/ai/generate-exam", params);
    return response;
  } catch (error) {
    console.error("Error generating exam:", error);
    throw error;
  }
};

// Phân tích kết quả thi
export const analyzeExamResult = async (examResultId) => {
  try {
    const response = await api.get(`/ai/analyze-exam/${examResultId}`);
    return response;
  } catch (error) {
    console.error("Error analyzing exam result:", error);
    throw error;
  }
};

// Gợi ý tài liệu học tập
export const suggestLearningMaterials = async (topic) => {
  try {
    const response = await api.post("/ai/suggest-materials", { topic });
    return response;
  } catch (error) {
    console.error("Error suggesting learning materials:", error);
    throw error;
  }
};

// Tạo mô phỏng toán học
export const createMathSimulation = async (params) => {
  try {
    const response = await api.post("/ai/create-simulation", params);
    return response;
  } catch (error) {
    console.error("Error creating math simulation:", error);
    throw error;
  }
};

export default {
  askMathQuestion,
  getMathHistory,
  generateExam,
  analyzeExamResult,
  suggestLearningMaterials,
  createMathSimulation,
};
