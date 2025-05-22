const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createAdapter } = require("@socket.io/redis-adapter");
const redisUtils = require("../config/redis");
const RateLimit = require("socket.io-rate-limiter");
const { promisify } = require("util");
const { gzip, gunzip } = require("zlib");
const gzipPromise = promisify(gzip);
const gunzipPromise = promisify(gunzip);

const setupSocketWithRedis = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Cấu hình rate limiting cho Socket.IO
  const rateLimiter = new RateLimit({
    windowMs: 60 * 1000, // 1 phút
    max: 30, // 30 sự kiện/phút
  });
  io.use(rateLimiter.middleware());

  // Tạo Redis adapter
  let pubClient, subClient;
  try {
    pubClient = redisUtils.getClient().duplicate();
    subClient = redisUtils.getClient().duplicate();
    Promise.all([pubClient.connect(), subClient.connect()])
      .then(() => {
        io.adapter(createAdapter(pubClient, subClient));
        console.log("Socket.IO Redis adapter initialized");
        // Đăng ký Pub/Sub cho thông báo phòng
        subClient.subscribe("room:*", (message, channel) => {
          const roomId = channel.split(":")[1];
          io.to(`room_${roomId}`).emit("new_message", JSON.parse(message));
        });
      })
      .catch((err) => {
        console.error("Failed to initialize Socket.IO Redis adapter:", err);
        setTimeout(() => {
          pubClient.connect().catch(() => {});
          subClient.connect().catch(() => {});
        }, 5000);
      });
  } catch (err) {
    console.error("Error setting up Redis adapter:", err);
    console.log("Using default in-memory adapter");
  }

  // Hàm retry cho các thao tác Redis/MongoDB
  const retryOperation = async (operation, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // Middleware xác thực
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error("Authentication error: Token not provided"));
      }

      const cacheKey = `auth_user:${token}`;
      let user = await redisUtils.getCache(cacheKey);
      if (!user) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id).select("-password");
        if (!user) {
          return next(new Error("Authentication error: User not found"));
        }
        const userString = JSON.stringify(user);
        const compressed = await gzipPromise(userString);
        await redisUtils.getClient().setEx(cacheKey, 3600, compressed);
      }
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error: " + error.message));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);
    socket.join(socket.user._id.toString());

    // Tham gia phòng học
    socket.on("join_room", async (roomId) => {
      if (!roomId) {
        socket.emit("error", { message: "Room ID is required" });
        return;
      }

      try {
        await retryOperation(async () => {
          const roomKey = `room:${roomId}:users`;
          const userData = {
            userId: socket.user._id,
            username: socket.user.username,
            avatar: socket.user.avatar,
            role: socket.user.role === "admin" ? "admin" : "member",
            joinedAt: new Date().toISOString(),
          };

          await redisUtils.getClient().sAdd(roomKey, JSON.stringify(userData));
          await redisUtils.getClient().expire(roomKey, 24 * 60 * 60);

          // Cập nhật MongoDB
          const StudyRoom = require("../models/StudyRoom");
          await StudyRoom.findByIdAndUpdate(roomId, {
            $addToSet: { members: socket.user._id },
            $set: { lastActive: new Date() },
          });

          socket.join(`room_${roomId}`);
          console.log(`${socket.user.username} joined room: ${roomId}`);

          const users = await redisUtils.getClient().sMembers(roomKey);
          const usersList = users.map((user) => JSON.parse(user));
          io.to(`room_${roomId}`).emit("room_users_updated", usersList);
          socket.to(`room_${roomId}`).emit("user_joined", userData);
        });
      } catch (error) {
        console.error(`Error joining room ${roomId}:`, error);
        socket.emit("error", { message: "Không thể tham gia phòng" });
      }
    });

    // Rời phòng học
    socket.on("leave_room", async (roomId) => {
      if (!roomId) {
        socket.emit("error", { message: "Room ID is required" });
        return;
      }

      try {
        await retryOperation(async () => {
          socket.leave(`room_${roomId}`);
          const roomKey = `room:${roomId}:users`;
          await redisUtils.getClient().sRem(
            roomKey,
            JSON.stringify({
              userId: socket.user._id,
              username: socket.user.username,
              avatar: socket.user.avatar,
              role: socket.user.role === "admin" ? "admin" : "member",
              joinedAt: socket.user.joinedAt,
            })
          );

          // Cập nhật MongoDB
          const StudyRoom = require("../models/StudyRoom");
          await StudyRoom.findByIdAndUpdate(roomId, {
            $pull: { members: socket.user._id },
            $set: { lastActive: new Date() },
          });

          const users = await redisUtils.getClient().sMembers(roomKey);
          const usersList = users.map((user) => JSON.parse(user));
          io.to(`room_${roomId}`).emit("room_users_updated", usersList);
          socket.to(`room_${roomId}`).emit("user_left", {
            userId: socket.user._id,
            username: socket.user.username,
          });
        });
      } catch (error) {
        console.error(`Error leaving room ${roomId}:`, error);
        socket.emit("error", { message: "Không thể rời phòng" });
      }
    });

    // Gửi tin nhắn
    socket.on("send_message", async ({ roomId, message, attachments = [] }) => {
      if (!roomId || !message) {
        socket.emit("error", { message: "Room ID and message are required" });
        return;
      }

      try {
        await retryOperation(async () => {
          const roomKey = `room:${roomId}:users`;
          const isInRoom = await redisUtils.getClient().sIsMember(
            roomKey,
            JSON.stringify({
              userId: socket.user._id,
              username: socket.user.username,
              avatar: socket.user.avatar,
              role: socket.user.role === "admin" ? "admin" : "member",
              joinedAt: socket.user.joinedAt,
            })
          );
          if (!isInRoom) {
            throw new Error("You are not a member of this room");
          }

          const messageData = {
            id: Date.now().toString(),
            userId: socket.user._id.toString(),
            username: socket.user.username,
            avatar: socket.user.avatar,
            message,
            attachments,
            timestamp: new Date().toISOString(),
          };

          const roomMessagesKey = `room:${roomId}:messages`;
          const messageString = JSON.stringify(messageData);
          const compressedMessage = await gzipPromise(messageString);
          await redisUtils.getClient().lPush(roomMessagesKey, compressedMessage);
          await redisUtils.getClient().lTrim(roomMessagesKey, 0, 99);
          await redisUtils.getClient().expire(roomMessagesKey, 24 * 60 * 60);

          // Sử dụng Pub/Sub để gửi tin nhắn
          await pubClient.publish(`room:${roomId}`, messageString);

          // Cập nhật MongoDB
          const StudyRoom = require("../models/StudyRoom");
          await StudyRoom.findByIdAndUpdate(roomId, {
            $push: {
              messages: {
                sender: socket.user._id,
                content: message,
                attachments,
                createdAt: new Date(),
              },
            },
            $set: { lastActive: new Date() },
          });
        });
      } catch (error) {
        console.error(`Error sending message to room ${roomId}:`, error);
        socket.emit("error", { message: error.message || "Không thể gửi tin nhắn" });
      }
    });

    // Lấy lịch sử tin nhắn
    socket.on("get_message_history", async (roomId) => {
      if (!roomId) {
        socket.emit("error", { message: "Room ID is required" });
        return;
      }

      try {
        const roomMessagesKey = `room:${roomId}:messages`;
        const messages = await redisUtils.getClient().lRange(roomMessagesKey, 0, -1);
        const messageHistory = await Promise.all(
          messages.map(async (msg) => {
            try {
              const decompressed = await gunzipPromise(Buffer.from(msg));
              return JSON.parse(decompressed.toString());
            } catch (e) {
              console.error("Error parsing message:", e);
              return null;
            }
          })
        );
        socket.emit("message_history", messageHistory.filter(Boolean).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
      } catch (error) {
        console.error(`Error getting message history for room ${roomId}:`, error);
        socket.emit("error", { message: "Không thể lấy lịch sử tin nhắn" });
      }
    });

    // Thông báo đang gõ
    socket.on("typing", ({ roomId }) => {
      if (!roomId) return;
      socket.to(`room_${roomId}`).emit("user_typing", {
        userId: socket.user._id,
        username: socket.user.username,
      });
    });

    // Kick user khỏi phòng (chỉ admin)
    socket.on("kick_user", async ({ roomId, userId }) => {
      if (socket.user.role !== "admin") {
        socket.emit("error", { message: "Chỉ admin mới có quyền kick" });
        return;
      }

      try {
        await retryOperation(async () => {
          const socketToKick = io.sockets.sockets.get(userId);
          if (socketToKick) {
            socketToKick.leave(`room_${roomId}`);
            socketToKick.emit("kicked", { roomId });
          }

          const roomKey = `room:${roomId}:users`;
          const users = await redisUtils.getClient().sMembers(roomKey);
          const userToRemove = users.find((user) => JSON.parse(user).userId === userId);
          if (userToRemove) {
            await redisUtils.getClient().sRem(roomKey, userToRemove);
          }

          const StudyRoom = require("../models/StudyRoom");
          await StudyRoom.findByIdAndUpdate(roomId, {
            $pull: { members: userId },
            $set: { lastActive: new Date() },
          });

          const updatedUsers = await redisUtils.getClient().sMembers(roomKey);
          const usersList = updatedUsers.map((user) => JSON.parse(user));
          io.to(`room_${roomId}`).emit("room_users_updated", usersList);
          io.to(`room_${roomId}`).emit("user_left", { userId });
        });
      } catch (error) {
        console.error(`Error kicking user ${userId} from room ${roomId}:`, error);
        socket.emit("error", { message: "Không thể kick người dùng" });
      }
    });

    // Gửi thông báo toàn cục (chỉ admin)
    socket.on("send_global_notification", async (message) => {
      if (socket.user.role !== "admin") {
        socket.emit("error", { message: "Chỉ admin mới có quyền gửi thông báo toàn cục" });
        return;
      }

      try {
        const notificationData = {
          message,
          timestamp: new Date().toISOString(),
        };
        io.emit("global_notification", notificationData);

        const Notification = require("../models/Notification");
        await Notification.create({
          recipient: null, // null để biểu thị thông báo toàn cục
          sender: socket.user._id,
          type: "system",
          title: "Thông báo hệ thống",
          message,
          importance: "high",
        });
      } catch (error) {
        console.error("Error sending global notification:", error);
        socket.emit("error", { message: "Không thể gửi thông báo toàn cục" });
      }
    });

    // Lấy thông báo
    socket.on("getNotifications", async (userId) => {
      try {
        const Notification = require("../models/Notification");
        const notifications = await Notification.find({ recipient: userId, read: false })
          .sort({ createdAt: -1 })
          .limit(10);

        const notificationKey = `notifications:${userId}`;
        const notificationString = JSON.stringify(notifications);
        const compressedNotifications = await gzipPromise(notificationString);
        await redisUtils.getClient().setEx(notificationKey, 300, compressedNotifications);

        io.to(userId).emit("newNotifications", notifications);

        socket.on("ackNotifications", async () => {
          await redisUtils.getClient().del(notificationKey);
        });
      } catch (error) {
        console.error(`Error sending notifications to ${userId}:`, error);
        socket.emit("error", { message: "Không thể lấy thông báo" });
      }
    });

    // Xử lý lỗi
    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.user?.username}:`, error);
    });

    // Ngắt kết nối
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.user.username}`);
      try {
        await retryOperation(async () => {
          const userRoomsPattern = `room:*:users`;
          const roomKeys = await redisUtils.getClient().keys(userRoomsPattern);
          for (const roomKey of roomKeys) {
            const exists = await redisUtils.getClient().sIsMember(
              roomKey,
              JSON.stringify({
                userId: socket.user._id,
                username: socket.user.username,
                avatar: socket.user.avatar,
                role: socket.user.role === "admin" ? "admin" : "member",
                joinedAt: socket.user.joinedAt,
              })
            );
            if (exists) {
              const roomId = roomKey.split(":")[1];
              await redisUtils.getClient().sRem(roomKey, JSON.stringify({
                userId: socket.user._id,
                username: socket.user.username,
                avatar: socket.user.avatar,
                role: socket.user.role === "admin" ? "admin" : "member",
                joinedAt: socket.user.joinedAt,
              }));

              const StudyRoom = require("../models/StudyRoom");
              await StudyRoom.findByIdAndUpdate(roomId, {
                $pull: { members: socket.user._id },
                $set: { lastActive: new Date() },
              });

              const users = await redisUtils.getClient().sMembers(roomKey);
              const usersList = users.map((user) => JSON.parse(user));
              io.to(`room_${roomId}`).emit("room_users_updated", usersList);
              io.to(`room_${roomId}`).emit("user_left", {
                userId: socket.user._id,
                username: socket.user.username,
              });
            }
          }
        });
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });

  io.engine.on("connection_error", (err) => {
    console.error("Socket.IO connection error:", err);
  });

  global.io = io;
  return io;
};

module.exports = setupSocketWithRedis;