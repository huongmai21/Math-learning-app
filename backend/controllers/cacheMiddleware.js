const redisUtils = require("../config/redis")

/**
 * Middleware để cache response API
 * @param {number} duration - Thời gian cache tính bằng giây
 * @returns {function} - Express middleware
 */
const cacheMiddleware = (duration = 3600) => {
  return async (req, res, next) => {
    // Bỏ qua cache cho các request không phải GET
    if (req.method !== "GET") {
      return next()
    }

    // Tạo cache key từ URL và query params
    const cacheKey = `api:cache:${req.originalUrl}`

    try {
      // Kiểm tra dữ liệu trong cache
      const cachedData = await redisUtils.getCache(cacheKey)

      if (cachedData) {
        // Nếu có dữ liệu trong cache, trả về ngay
        console.log(`Cache hit for: ${req.originalUrl}`)
        return res.status(200).json(cachedData)
      }

      // Nếu không có trong cache, tiếp tục xử lý request
      console.log(`Cache miss for: ${req.originalUrl}`)

      // Lưu response gốc để sử dụng sau
      const originalSend = res.json

      // Override phương thức json để lưu response vào cache
      res.json = function (data) {
        // Chỉ cache các response thành công
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisUtils.setCache(cacheKey, data, duration).catch((err) => console.error("Error caching response:", err))
        }

        // Gọi phương thức json gốc
        return originalSend.call(this, data)
      }

      next()
    } catch (error) {
      console.error("Cache middleware error:", error)
      next() // Tiếp tục xử lý request nếu có lỗi với cache
    }
  }
}

/**
 * Middleware để xóa cache khi có thay đổi dữ liệu
 * @param {string} pattern - Pattern của cache key cần xóa
 * @returns {function} - Express middleware
 */
const clearCacheMiddleware = (pattern) => {
  return async (req, res, next) => {
    // Lưu response gốc để sử dụng sau
    const originalSend = res.json

    // Override phương thức json để xóa cache sau khi response thành công
    res.json = function (data) {
      // Chỉ xóa cache nếu request thành công
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redisUtils
          .clearCachePattern(pattern)
          .then(() => console.log(`Cleared cache pattern: ${pattern}`))
          .catch((err) => console.error("Error clearing cache:", err))
      }

      // Gọi phương thức json gốc
      return originalSend.call(this, data)
    }

    next()
  }
}

module.exports = {
  cacheMiddleware,
  clearCacheMiddleware,
}
