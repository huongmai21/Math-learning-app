const express = require("express");
const cors = require("cors");
// const cookieParser = require("cookie-parser");
const path = require("path");
const http = require('http');
// const setupSocket = require('./socket/socket');
const connectMongoDB = require("./config/mongo");

// Load env vars
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

// Create Express app
const app = express();

const server = http.createServer(app);
const io = setupSocket(server);

// Middleware
// app.use(cookieParser());
app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "..", "frontend", "public")));

const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const newsRoutes = require("./routes/newsRoutes");
const examRoutes = require("./routes/examRoutes");
const documentRoutes = require("./routes/documentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const postRoutes = require("./routes/postRoutes");
// const studyCornerRoutes = require("./routes/");
const studyRoomRoutes = require("./routes/studyRoomRoutes");
const commentRoutes = require("./routes/commentRoutes");

// Routes
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/news", newsRoutes);
app.use("/exams", examRoutes);
app.use("/documents", documentRoutes);
app.use("/courses", courseRoutes);
app.use('/posts', postRoutes);
// app.use("/study-corner", studyCornerRoutes);
app.use("/study-room", studyRoomRoutes);
app.use("/comments", commentRoutes);

// React Router fallback
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "public", "index.html"));
});

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

// Log registered routes
console.log("Registered routes:");
app._router.stack.forEach((layer) => {
  if (layer.route) {
    console.log(`${layer.route.path} => [${Object.keys(layer.route.methods).join(", ")}]`);
  } else if (layer.name === "router" && layer.handle.stack) {
    layer.handle.stack.forEach((nested) => {
      if (nested.route) {
        console.log(`(nested) ${nested.route.path} => [${Object.keys(nested.route.methods).join(", ")}]`);
      }
    });
  }
});

// Kết nối MongoDB và khởi động server
connectMongoDB();

c// Xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
