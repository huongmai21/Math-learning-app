// src/services/examService.js
import api from './api';

export const getExams = async (params) => {
  const response = await api.get({ params });
  return response.data;
};

export const followExam = async (examId) => {
  const response = await api.post(`/${examId}/follow`);
  return response.data;
};