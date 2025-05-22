const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (buffer, folder) => {
  try {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || process.env.DEFAULT_UPLOAD_FOLDER || "Home",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          throw new Error(`Lỗi upload lên Cloudinary: ${error.message}`);
        }
        return result;
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(stream);

    return new Promise((resolve, reject) => {
      stream.on("finish", () => resolve(stream.response));
      stream.on("error", (err) => reject(err));
    });
  } catch (error) {
    console.error("Lỗi upload lên Cloudinary:", error.message);
    throw new Error(`Lỗi upload lên Cloudinary: ${error.message}`);
  }
};

module.exports = { cloudinary, uploadToCloudinary };