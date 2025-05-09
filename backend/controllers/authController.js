const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi"); // Thêm Joi
const User = require("../models/User");

// Schema validate đăng ký
const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d]{8,}$"))
    .required()
    .messages({
      "string.pattern.base":
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.",
    }),
  role: Joi.string().valid("student", "teacher", "admin").required(),
});

// Schema validate đăng nhập
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Hàm tạo token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    }
  );
};

// Đăng ký
exports.register = async (req, res) => {
  try {
    // Validate dữ liệu đầu vào
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      avatar: null,
    });

    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình đăng ký." });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    // Validate dữ liệu đầu vào
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không chính xác." });
    }

    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình đăng nhập." });
  }
};

// Lấy thông tin user hiện tại
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi." });
  }
};

// Cập nhật avatar
exports.updateAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    user.avatar = req.body.avatarUrl;
    await user.save();

    res.status(200).json({ message: "Cập nhật avatar thành công." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi cập nhật avatar." });
  }
};


// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        username,
        bio,
        avatar,
        updatedAt: Date.now(),
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công!",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cập nhật thông tin thất bại!",
      error: error.message,
    });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Tìm người dùng
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không chính xác!",
      });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Cập nhật mật khẩu
    user.password = hashedPassword;
    user.updatedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Đổi mật khẩu thất bại!",
      error: error.message,
    });
  }
};
