const { cloudinary, uploadToCloudinary } = require("../config/cloudinary");
const upload = require("../middleware/multer");

exports.uploadFile = [
  upload.single("file"), // Sử dụng middleware multer với field name "file"
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Không có file được tải lên!" });
      }

      const folder = req.body.folder || "Home"; // Lấy folder từ body, mặc định là "Home"
      const result = await uploadToCloudinary(req.file.buffer, folder);

      res.status(200).json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Lỗi upload file", error: error.message });
    }
  },
];

exports.uploadImage = async (req, res) => {
  try {
    const file = req.body.image; // Giả sử gửi base64 hoặc file
    const result = await cloudinary.uploader.upload(file, {
      folder: "Home",
      resource_type: "image",
    });
    res.json({ url: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: "Lỗi upload ảnh", error: error.message });
  }
};