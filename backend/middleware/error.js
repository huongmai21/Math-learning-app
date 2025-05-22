const ErrorResponse = require("../utils/errorResponse")

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error chi tiết trong môi trường development
  if (process.env.NODE_ENV === "development") {
    console.error("Error stack:", err.stack)
  } else {
    console.error("Error:", err.message)
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Không tìm thấy tài nguyên với ID ${err.value}`
    error = new ErrorResponse(message, 404)
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const value = err.keyValue[field]
    const message = `Trường ${field} với giá trị '${value}' đã tồn tại`
    error = new ErrorResponse(message, 400)
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = {}

    // Tạo object chứa các lỗi validation
    Object.keys(err.errors).forEach((field) => {
      errors[field] = err.errors[field].message
    })

    const message = "Dữ liệu không hợp lệ"
    error = new ErrorResponse(message, 400)
    error.errors = errors
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new ErrorResponse("Token không hợp lệ", 401)
  }

  if (err.name === "TokenExpiredError") {
    error = new ErrorResponse("Token đã hết hạn", 401)
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    error = new ErrorResponse("File quá lớn", 400)
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    error = new ErrorResponse("File không được chấp nhận", 400)
  }

  // Dọn dẹp file tạm nếu có lỗi
  if (req.file || req.files) {
    const { cleanupTempFiles } = require("./multer")
    cleanupTempFiles(req)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Lỗi server",
    errors: error.errors || null,
    stack: process.env.NODE_ENV === "development" ? err.stack : null,
  })
}

module.exports = errorHandler
