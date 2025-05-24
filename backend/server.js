require("dotenv").config({ path: require("path").resolve(__dirname, ".env") }); // Di chuyển lên đầu
console.log("REDIS_URL from .env:", process.env.REDIS_URL); // Thêm dòng này

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
const redisUtils = require("./config/redis"); // Import sau khi dotenv được gọi
const setupSocketWithRedis = require("./socket/socketRedis");
const documentProcessingService = require("./services/documentProcessingService");
const winston = require("winston");
const fs = require("fs").promises;
const mongoose = require("mongoose");

// Cấu hình logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// Kiểm tra biến môi trường bắt buộc
const checkEnvVariables = () => {
  const requiredEnv = [
    "MONGO_URI",
    "REDIS_URL",
    "JWT_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "CLIENT_URL",
  ];
  const missing = requiredEnv.filter((env) => !process.env[env]);
  if (missing.length > 0) {
    logger.error(`Thiếu các biến môi trường: ${missing.join(", ")}`);
    throw new Error(`Thiếu các biến môi trường: ${missing.join(", ")}`);
  }
};

// Khởi tạo Redis trước
const initializeServer = async () => {
  try {
    checkEnvVariables();
    logger.info("Biến môi trường kiểm tra thành công");
    await redisUtils.connectRedis();
    logger.info("Kết nối Redis thành công");
    await connectMongoDB();
    logger.info("Kết nối MongoDB thành công");
    logger.info("Khởi tạo server thành công");
  } catch (err) {
    logger.error("Khởi tạo server thất bại:", {
      message: err.message,
      stack: err.stack,
    });
    console.error("Chi tiết lỗi:", err);
    process.exit(1);
  }
};

// Dọn dẹp file tạm
const cleanupTempFiles = async () => {
  try {
    const tempDir = "/tmp/";
    const files = await fs.readdir(tempDir);
    for (const file of files) {
      if (file.startsWith("express-upload-")) {
        await fs.unlink(path.join(tempDir, file));
        logger.info(`Đã xóa file tạm: ${file}`);
      }
    }
  } catch (err) {
    logger.error("Lỗi khi dọn dẹp file tạm:", err);
  }
};

// Chạy dọn dẹp mỗi giờ
setInterval(cleanupTempFiles, 60 * 60 * 1000);

// Khởi tạo ứng dụng
const app = express();
const server = http.createServer(app);
const io = setupSocketWithRedis(server);
global.io = io;

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau 15 phút.",
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Quá nhiều yêu cầu reset mật khẩu, vui lòng thử lại sau 1 giờ.",
});

const notificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
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
    secret: process.env.JWT_SECRET,
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
// const authMiddleware = require("./middleware/auth");
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

app.use("/admin",  adminRoutes);
app.use("/auth/login", loginLimiter, authRoutes);
app.use("/auth/forgot-password", forgotPasswordLimiter, authRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/users/profile", profileRoutes);
app.use("/documents", documentRoutes);
app.use("/news", newsRoutes);
app.use("/courses", courseRoutes);
app.use("/exams",  examRoutes);
app.use("/posts",  postRoutes);
app.use("/study-room",  studyRoomRoutes);
app.use("/search",  searchRoutes);
app.use("/bookmarks",  bookmarkRoutes);
app.use("/comments",  commentRoutes);
app.use("/notifications",  notificationLimiter, notificationsRoutes);
app.use("/upload",  uploadRoutes);

// Cloudinary preset endpoint
app.get("/cloudinary-upload-preset", (req, res) => {
  try {
    const preset = {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    };
    res.status(200).json({ success: true, data: preset });
  } catch (error) {
    logger.error("Lỗi khi lấy thông tin Cloudinary:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin Cloudinary",
    });
  }
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info("Đang tắt server...");
  try {
    await redisUtils.getClient().quit();
    logger.info("Đóng kết nối Redis");
    await mongoose.connection.close();
    logger.info("Đóng kết nối MongoDB");
    server.close(() => {
      logger.info("Server đã dừng");
      process.exit(0);
    });
  } catch (err) {
    logger.error("Lỗi khi tắt server:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Khởi động server
const PORT = process.env.PORT || 5000;
initializeServer().then(() => {
  server.listen(PORT, () => {
    logger.info(`Server chạy trên cổng ${PORT}`);
    if (process.env.NODE_ENV !== "test") {
      documentProcessingService.startWorker(2);
    }
  });
});

// Xử lý lỗi
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  gracefulShutdown();
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  gracefulShutdown();
});