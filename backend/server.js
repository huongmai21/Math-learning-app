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
const { RedisStore } = require("connect-redis");
const redisUtils = require("./config/redis");
const setupSocketWithRedis = require("./socket/socketRedis");
const documentProcessingService = require("./services/documentProcessingService");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// Khởi tạo Redis trước
const initializeServer = async () => {
  try {
    await redisUtils.initializeRedis();
    await connectMongoDB();
  } catch (err) {
    console.error("Khởi tạo server thất bại:", err.message);
    process.exit(1);
  }
};

// Khởi tạo ứng dụng
const app = express();
const server = http.createServer(app);
const io = setupSocketWithRedis(server);
global.io = io;

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau 15 phút.",
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Quá nhiều yêu cầu reset mật khẩu, vui lòng thử lại sau 1 giờ.",
});

const notificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút.",
});

// Cấu hình CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type"],
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.options("*", cors(corsOptions));

// Session với Redis
app.use(
  session({
    store: new RedisStore({
      client: redisUtils.getClient(),
      prefix: "sess:",
      ttl: 60 * 60 * 24,
      disableTouch: true,
    }),
    secret: process.env.JWT_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// Routes
const authMiddleware = require("./middleware/auth");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const profileRoutes = require("./routes/profileRoutes");
const newsRoutes = require("./routes/newsRoutes");
const documentRoutes = require("./routes/documentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const examRoutes = require("./routes/examRoutes");
const postRoutes = require("./routes/postRoutes");
const studyRoomRoutes = require("./routes/studyRoomRoutes");
const commentRoutes = require("./routes/commentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const searchRoutes = require("./routes/searchRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");

app.use("/admin", authMiddleware, adminRoutes);
app.use("/auth/login", loginLimiter, authRoutes);
app.use("/auth/forgot-password", forgotPasswordLimiter, authRoutes);
app.use("/auth", authRoutes);
app.use("/users", authMiddleware, usersRoutes);
app.use("/users/profile", authMiddleware, profileRoutes);
app.use("/documents", authMiddleware, documentRoutes);
app.use("/news", newsRoutes);
app.use("/courses", authMiddleware, courseRoutes);
app.use("/exams", authMiddleware, examRoutes);
app.use("/posts", authMiddleware, postRoutes);
app.use("/study-room", authMiddleware, studyRoomRoutes);
app.use("/search", authMiddleware, searchRoutes);
app.use("/bookmarks", authMiddleware, bookmarkRoutes);
app.use("/comments", authMiddleware, commentRoutes);
app.use(
  "/notifications",
  authMiddleware,
  notificationLimiter,
  notificationsRoutes
);
app.use("/upload", authMiddleware, uploadRoutes);

// Cloudinary preset endpoint
app.get("/cloudinary-upload-preset", (req, res) => {
  try {
    const preset = {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    };
    res.status(200).json({ success: true, data: preset });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin Cloudinary:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin Cloudinary",
    });
  }
});

// Error handler
app.use(errorHandler);

// Khởi động server
const PORT = process.env.PORT || 5000;
initializeServer().then(() => {
  server.listen(PORT, () => {
    console.log(`Server chạy trên cổng ${PORT}`);
    if (process.env.NODE_ENV !== "test") {
      documentProcessingService.startWorker(2);
    }
  });
});

// Xử lý lỗi
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(() => process.exit(1));
});
