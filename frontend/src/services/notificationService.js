// frontend/src/services/notificationService.js
import api from "./api";

export const getNotifications = async (userId) => {
  try {
    const response = await api.get(`/notifications/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Không thể lấy thông báo");
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Không thể xóa thông báo");
  }
};

export const markNotificationRead = async (id) => {
  try {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    throw new Error(error.message || "Không thể đánh dấu thông báo đã đọc");
  }
};