const { createClient } = require("redis");

// Kiểm tra biến môi trường
const checkRedisConfig = () => {
  if (!process.env.REDIS_URL) {
    throw new Error("Thiếu biến môi trường REDIS_URL");
  }
};

// Tạo Redis client với cấu hình
const createRedisClient = () => {
  checkRedisConfig();
  const client = createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        const delay = Math.min(retries * 1000, 10000);
        console.log(`Redis reconnecting in ${delay}ms...`);
        return delay;
      },
    },
  });

  client.on("connect", () => {
    console.log("Redis client connected");
  });

  client.on("error", (err) => {
    console.error("Redis error:", err);
  });

  return client;
};

// Tạo Redis client
const redisClient = createRedisClient();

// Kết nối Redis với retry logic
const connectRedis = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      if (redisClient.isReady) {
        console.log("Redis already connected");
        return redisClient;
      }
      await redisClient.connect();
      return redisClient;
    } catch (err) {
      console.error(`Redis connection attempt ${i + 1} failed:`, err.message);
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Kiểm tra trạng thái kết nối định kỳ
const checkConnection = async () => {
  try {
    await redisClient.ping();
    console.log("Redis connection is healthy");
  } catch (err) {
    console.error("Redis connection lost, attempting to reconnect...");
    await connectRedis();
  }
};

// Kiểm tra kết nối mỗi 30 giây
setInterval(checkConnection, 30 * 1000);

// Hàm tiện ích để set cache (không nén)
const setCache = async (key, value, expirySeconds) => {
  try {
    const valueString = JSON.stringify(value);
    const sizeInKB = Buffer.byteLength(valueString) / 1024;

    if (sizeInKB > 500) {
      console.warn(
        `Cache value too large (${Math.round(sizeInKB)}KB) for key: ${key}`
      );
      return false;
    }

    await redisClient.setEx(key, expirySeconds, valueString);
    return true;
  } catch (err) {
    console.error("Error setting cache:", err);
    return false;
  }
};

// Hàm tiện ích để get cache (không giải nén)
const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (err) {
    console.error("Error getting cache:", err);
    return null;
  }
};

// Hàm xóa cache theo pattern
const clearCachePattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(
        `Cleared ${keys.length} cache keys matching pattern: ${pattern}`
      );
    }
    return true;
  } catch (err) {
    console.error("Error clearing cache pattern:", err);
    return false;
  }
};

// Hàm dọn dẹp cache
const cleanupCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(
        `Cleaned up ${keys.length} cache keys matching pattern: ${pattern}`
      );
    }
    return true;
  } catch (err) {
    console.error("Error cleaning up cache:", err);
    return false;
  }
};

module.exports = {
  getClient: () => redisClient,
  setCache,
  getCache,
  clearCachePattern,
  connectRedis,
  cleanupCache,
};
