// backend/config/cloudinary.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Hàm tải file lên Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "Home", // Thư mục trên Cloudinary (ví dụ: "documents")
      resource_type: "auto", // Tự động xác định loại tài nguyên (image, video, raw,...)
    });
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

module.exports = { cloudinary, uploadToCloudinary };