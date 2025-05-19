const socketIo = require("socket.io")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { createAdapter } = require("@socket.io/redis-adapter")
const redisUtils = require("../config/redis")

const setupSocketWithRedis = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  // Tạo Redis adapter cho Socket.IO
  const pubClient = redisUtils.getClient().duplicate()
  const subClient = redisUtils.getClient().duplicate()

  io.adapter(createAdapter(pubClient, subClient))

  // Middleware để xác thực người dùng qua token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token

      if (!token) {
        return next(new Error("Authentication error: Token not provided"))
      }

      // Kiểm tra token trong Redis cache trước
      const cacheKey = `socket:auth:${token.substring(0, 10)}`
      let user = await redisUtils.getCache(cacheKey)

      if (!user) {
        // Nếu không có trong cache, xác thực bằng JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        user = await User.findById(decoded.id).select("-password")

        if (!user) {
          return next(new Error("Authentication error: User not found"))
        }

        // Lưu vào cache để sử dụng lần sau
        await redisUtils.setCache(cacheKey, user, 3600) // Cache 1 giờ
      }

      socket.user = user
      next()
    } catch (error) {
      next(new Error("Authentication error: " + error.message))
    }
  })

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`)

    // Tham gia phòng cá nhân để nhận thông báo
    socket.join(socket.user._id.toString())

    // Tham gia phòng học
    socket.on("join_room", async (roomId) => {
      socket.join(`room_${roomId}`)
      console.log(`${socket.user.username} joined room: ${roomId}`)

      // Lưu thông tin người dùng tham gia phòng vào Redis
      const roomKey = `room:${roomId}:users`
      const userData = {
        userId: socket.user._id,
        username: socket.user.username,
        avatar: socket.user.avatar,
        joinedAt: new Date().toISOString(),
      }

      // Thêm người dùng vào danh sách phòng trong Redis
      await redisUtils.getClient().hset(roomKey, socket.user._id.toString(), JSON.stringify(userData))

      // Lấy danh sách người dùng trong phòng
      const roomUsers = await redisUtils.getClient().hgetall(roomKey)
      const usersList = Object.values(roomUsers).map((user) => JSON.parse(user))

      // Thông báo cho tất cả người dùng trong phòng
      io.to(`room_${roomId}`).emit("room_users_updated", usersList)

      // Thông báo cho các thành viên khác
      socket.to(`room_${roomId}`).emit("user_joined", userData)
    })

    // Rời phòng học
    socket.on("leave_room", async (roomId) => {
      socket.leave(`room_${roomId}`)
      console.log(`${socket.user.username} left room: ${roomId}`)

      // Xóa thông tin người dùng khỏi phòng trong Redis
      const roomKey = `room:${roomId}:users`
      await redisUtils.getClient().hdel(roomKey, socket.user._id.toString())

      // Lấy danh sách người dùng còn lại trong phòng
      const roomUsers = await redisUtils.getClient().hgetall(roomKey)
      const usersList = Object.values(roomUsers).map((user) => JSON.parse(user))

      // Thông báo cho tất cả người dùng trong phòng
      io.to(`room_${roomId}`).emit("room_users_updated", usersList)

      // Thông báo cho các thành viên khác
      socket.to(`room_${roomId}`).emit("user_left", {
        userId: socket.user._id,
        username: socket.user.username,
      })
    })

    // Gửi tin nhắn trong phòng học
    socket.on("send_message", async ({ roomId, message }) => {
      // Lưu tin nhắn vào Redis
      const messageData = {
        userId: socket.user._id,
        username: socket.user.username,
        avatar: socket.user.avatar,
        message,
        timestamp: new Date().toISOString(),
      }

      // Lưu tin nhắn vào danh sách tin nhắn của phòng
      const roomMessagesKey = `room:${roomId}:messages`
      await redisUtils.getClient().lpush(roomMessagesKey, JSON.stringify(messageData))

      // Giới hạn số lượng tin nhắn lưu trữ (100 tin nhắn gần nhất)
      await redisUtils.getClient().ltrim(roomMessagesKey, 0, 99)

      // Gửi tin nhắn đến tất cả người dùng trong phòng
      io.to(`room_${roomId}`).emit("new_message", messageData)
    })

    // Lấy lịch sử tin nhắn
    socket.on("get_message_history", async (roomId) => {
      const roomMessagesKey = `room:${roomId}:messages`
      const messages = await redisUtils.getClient().lrange(roomMessagesKey, 0, -1)

      // Chuyển đổi từ JSON string sang object và sắp xếp theo thời gian
      const messageHistory = messages
        .map((msg) => JSON.parse(msg))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

      // Gửi lịch sử tin nhắn cho người dùng yêu cầu
      socket.emit("message_history", messageHistory)
    })

    // Thông báo đang gõ
    socket.on("typing", ({ roomId }) => {
      socket.to(`room_${roomId}`).emit("user_typing", {
        userId: socket.user._id,
        username: socket.user.username,
      })
    })

    // Ngắt kết nối
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.user.username}`)

      // Tìm và rời khỏi tất cả các phòng học
      const userRoomsPattern = `room:*:users`
      const roomKeys = await redisUtils.getClient().keys(userRoomsPattern)

      for (const roomKey of roomKeys) {
        // Kiểm tra xem người dùng có trong phòng không
        const exists = await redisUtils.getClient().hexists(roomKey, socket.user._id.toString())

        if (exists) {
          // Lấy roomId từ key (room:ROOMID:users)
          const roomId = roomKey.split(":")[1]

          // Xóa người dùng khỏi phòng
          await redisUtils.getClient().hdel(roomKey, socket.user._id.toString())

          // Lấy danh sách người dùng còn lại trong phòng
          const roomUsers = await redisUtils.getClient().hgetall(roomKey)
          const usersList = Object.values(roomUsers).map((user) => JSON.parse(user))

          // Thông báo cho tất cả người dùng trong phòng
          io.to(`room_${roomId}`).emit("room_users_updated", usersList)

          // Thông báo cho các thành viên khác
          io.to(`room_${roomId}`).emit("user_left", {
            userId: socket.user._id,
            username: socket.user.username,
          })
        }
      }
    })
  })

  // Lưu trữ io để sử dụng ở nơi khác
  global.io = io

  return io
}

module.exports = setupSocketWithRedis
