// backend/config/redis.js
const { createClient } = require("redis");

const redisClient = createClient({
  legacyMode: true, // cần cho connect-redis v8
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Kết nối Redis ngay lập tức
redisClient.connect().catch((err) => {
  console.error("Failed to connect to Redis:", err);
});

// Sự kiện khi kết nối thành công
redisClient.on("connect", () => {
  console.log("Redis client connected");
});

// Sự kiện khi có lỗi
redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

// Hàm kiểm tra trạng thái kết nối
const getClient = () => {
  if (!redisClient.isOpen) {
    throw new Error("Redis client is not connected");
  }
  return redisClient;
};

// Hàm tiện ích để set cache
const setCache = async (key, value, expirySeconds) => {
  try {
    await redisClient.setEx(key, expirySeconds, JSON.stringify(value));
  } catch (err) {
    console.error("Error setting cache:", err);
  }
};

// Hàm tiện ích để get cache
const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Error getting cache:", err);
    return null;
  }
};

module.exports = {
  getClient,
  setCache,
  getCache,
};