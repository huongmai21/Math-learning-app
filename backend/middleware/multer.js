const multer = require("multer");

const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png/;
  const pdfType = /pdf/;
  const mimetype = imageTypes.test(file.mimetype) || pdfType.test(file.mimetype);
  const extname = imageTypes.test(file.originalname.toLowerCase()) || pdfType.test(file.originalname.toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Chỉ hỗ trợ file JPEG, JPG, PNG hoặc PDF!"));
};

const storage = multer.memoryStorage(); // Sử dụng memoryStorage để xử lý file lớn
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Tăng lên 10MB để hỗ trợ PDF
  fileFilter,
});

module.exports = upload;