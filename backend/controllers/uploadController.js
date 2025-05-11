const cloudinary = require("cloudinary").v2;

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
