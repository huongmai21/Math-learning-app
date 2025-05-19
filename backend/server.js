// backend/server.js
const express = require("express");
const connectMongoDB = require("./config/mongo");
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const { Server } = require("socket.io");
const http = require("http");
const fileUpload = require("express-fileupload");
const errorHandler = require("./middleware/error");
const session = require("express-session");
const { RedisStore } = require("connect-redis"); // Import trực tiếp RedisStore
const redisUtils = require("./config/redis");
const setupSocketWithRedis = require("./socket/socketRedis");
const documentProcessingService = require("./services/documentProcessingService");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// MongoDB Connection
connectMongoDB();

const app = express();
const server = http.createServer(app);
// Sử dụng socket với Redis
const io = setupSocketWithRedis(server);

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 request mỗi IP
  message: "Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau 15 phút.",
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Giới hạn 3 request mỗi IP
  message: "Quá nhiều yêu cầu reset mật khẩu, vui lòng thử lại sau 1 giờ.",
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Cấu hình session với Redis
let redisClient;
try {
  redisClient = redisUtils.getClient();
  console.log("Redis client initialized successfully");
} catch (err) {
  console.error("Error initializing Redis client:", err.message);
  process.exit(1); // Thoát nếu không thể kết nối Redis
}

console.log("RedisStore:", RedisStore); // Debug RedisStore

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.JWT_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

// Thêm logging cho các routes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Thêm middleware kiểm tra token
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    console.log("Token được gửi trong request:", token.substring(0, 10) + "...");
  }
  next();
});

const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const profileRoutes = require("./routes/profileRoutes");
const newsRoutes = require("./routes/newsRoutes");
const examRoutes = require("./routes/examRoutes");
const documentRoutes = require("./routes/documentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const postRoutes = require("./routes/postRoutes");
const studyRoomRoutes = require("./routes/studyRoomRoutes");
const commentRoutes = require("./routes/commentRoutes");
const Upload = require("./routes/upload");
const Notifications = require("./routes/notificationsRoutes");
const Search = require("./routes/searchRoutes");
const Bookmark = require("./routes/bookmarkRoutes");

// Routes
app.use("/auth/login", loginLimiter);
app.use("/auth/forgot-password", forgotPasswordLimiter);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/users/profile", profileRoutes);
app.use("/documents", documentRoutes);
app.use("/news", newsRoutes);
app.use("/courses", courseRoutes);
app.use("/exams", examRoutes);
app.use("/posts", postRoutes);
app.use("/study-room", studyRoomRoutes);
app.use("/search", Search);
app.use("/bookmarks", Bookmark);
app.use("/comments", commentRoutes);
app.use("/notifications", Notifications);
app.use("/upload", Upload);

app.use(errorHandler);

// Cloudinary preset endpoint
app.get("/cloudinary-upload-preset", (req, res) => {
  try {
    const preset = {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    };
    res.status(200).json(preset);
  } catch (error) {
    console.error("Error fetching Cloudinary preset:", error.message);
    res.status(500).json({
      message: "Lỗi khi lấy thông tin Cloudinary",
      error: error.message,
    });
  }
});

// Socket.io
global.io = io; // Lưu io vào global để dùng trong controller

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId); // User joins their own room
    console.log(`User ${userId} joined room`);
  });
  socket.on("bookmark", ({ userId, referenceType, referenceId, action }) => {
    // Gửi thông báo đến người dùng và admin
    io.to(userId).emit("bookmark_notification", {
      message: `Bạn đã ${
        action === "add" ? "đánh dấu" : "bỏ đánh dấu"
      } ${referenceType} ${referenceId}`,
      referenceType,
      referenceId,
      action,
    });
    // Gửi đến admin (giả định admin ở room "admin")
    io.to("admin").emit("bookmark_notification", {
      message: `Người dùng ${userId} đã ${
        action === "add" ? "đánh dấu" : "bỏ đánh dấu"
      } ${referenceType} ${referenceId}`,
      userId,
      referenceType,
      referenceId,
      action,
    });
  });
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Khởi động worker xử lý tài liệu
  if (process.env.NODE_ENV !== "test") {
    documentProcessingService.startWorker(2);
  }
});

// Thêm xử lý lỗi không bắt được
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});