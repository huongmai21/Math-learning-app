const { createClient } = require("redis");
const { promisify } = require("util");
const { gzip, gunzip } = require("zlib");

const gzipPromise = promisify(gzip);
const gunzipPromise = promisify(gunzip);

// Tạo Redis client với cấu hình
const createRedisClient = () => {
  const client = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
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

// Kết nối Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    return null;
  }
};

// Hàm kiểm tra trạng thái kết nối
const getClient = () => {
  if (!redisClient.isOpen) {
    console.warn("Redis client is not connected, attempting to reconnect...");
    connectRedis().catch((err) => console.error("Redis reconnection failed:", err));
  }
  return redisClient;
};

// Hàm tiện ích để set cache với nén
const setCache = async (key, value, expirySeconds) => {
  try {
    const valueString = JSON.stringify(value);
    const compressed = await gzipPromise(valueString);
    const sizeInKB = Buffer.byteLength(compressed) / 1024;

    if (sizeInKB > 500) {
      console.warn(`Cache value too large (${Math.round(sizeInKB)}KB) for key: ${key}`);
      return false;
    }

    await getClient().setEx(key, expirySeconds, compressed);
    return true;
  } catch (err) {
    console.error("Error setting cache:", err);
    return false;
  }
};

// Hàm tiện ích để get cache với giải nén
const getCache = async (key) => {
  try {
    const data = await getClient().getBuffer(key);
    if (!data) return null;
    const decompressed = await gunzipPromise(data);
    return JSON.parse(decompressed.toString());
  } catch (err) {
    console.error("Error getting cache:", err);
    return null;
  }
};

// Hàm xóa cache theo pattern
const clearCachePattern = async (pattern) => {
  try {
    const keys = await getClient().keys(pattern);
    if (keys.length > 0) {
      await getClient().del(keys);
      console.log(`Cleared ${keys.length} cache keys matching pattern: ${pattern}`);
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
    const keys = await getClient().keys(pattern);
    if (keys.length > 0) {
      await getClient().del(keys);
      console.log(`Cleaned up ${keys.length} cache keys matching pattern: ${pattern}`);
    }
    return true;
  } catch (err) {
    console.error("Error cleaning up cache:", err);
    return false;
  }
};

// Khởi tạo kết nối Redis
connectRedis().catch((err) => console.error("Initial Redis connection failed:", err));

module.exports = {
  getClient,
  setCache,
  getCache,
  clearCachePattern,
  connectRedis,
  cleanupCache,
};