import api from "./api"

// Lấy tất cả thông báo của người dùng
export const getNotifications = async (userId) => {
  try {
    const response = await api.get(`/notifications`)
    return response.data
  } catch (error) {
    console.error("Error fetching notifications:", error)
    throw error
  }
}

// Đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`)
    return response.data
  } catch (error) {
    console.error("Error marking notification as read:", error)
    throw error
  }
}

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.put("/notifications/read-all")
    return response.data
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    throw error
  }
}

// Xóa thông báo
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`)
    return response.data
  } catch (error) {
    console.error("Error deleting notification:", error)
    throw error
  }
}

// Tạo thông báo mới (chủ yếu dùng cho admin)
export const createNotification = async (notificationData) => {
  try {
    const response = await api.post("/notifications", notificationData)
    return response.data
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

export default {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
}
