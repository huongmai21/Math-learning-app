const Document = require("../models/Document");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.createDocument = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new ErrorResponse("Chỉ admin mới có thể tạo tài liệu", 403));
  }

  let {
    title,
    description,
    content,
    educationLevel,
    grade,
    subject,
    documentType,
    tags,
  } = req.body;

  // Kiểm tra định dạng file
  const allowedFileTypes = [".pdf", ".doc", ".docx"];
  if (
    req.files?.file &&
    !allowedFileTypes.some((type) => req.files.file.name.endsWith(type))
  ) {
    return next(new ErrorResponse("Chỉ chấp nhận file PDF, DOC, DOCX", 400));
  }

  let fileUrl = "";
  if (req.files?.file) {
    try {
      const uploadResult = await cloudinary.uploader.upload(
        req.files.file.tempFilePath,
        {
          folder: "documents",
          resource_type: "auto",
        }
      );
      fileUrl = uploadResult.secure_url;
    } catch (err) {
      console.error("Cloudinary upload file error:", err);
      return next(new ErrorResponse("Lỗi khi upload file lên Cloudinary", 500));
    }
  }

  let thumbnailUrl = "";
  if (req.files?.thumbnail) {
    try {
      const uploadResult = await cloudinary.uploader.upload(
        req.files.thumbnail.tempFilePath,
        {
          folder: "thumbnails",
          resource_type: "image",
        }
      );
      thumbnailUrl = uploadResult.secure_url;
    } catch (err) {
      console.error("Cloudinary upload thumbnail error:", err);
      return next(
        new ErrorResponse("Lỗi khi upload thumbnail lên Cloudinary", 500)
      );
    }
  }

  const document = await Document.create({
    title,
    description,
    content,
    fileUrl,
    thumbnail: thumbnailUrl,
    educationLevel,
    grade: educationLevel !== "university" ? grade : undefined,
    subject: educationLevel === "university" ? subject : undefined,
    documentType,
    tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    uploadedBy: req.user.id,
    status: "published",
  });

  const users = await require("../models/User").find({
    _id: { $ne: req.user.id },
  });
  const notifications = users.map((user) => ({
    recipient: user._id,
    sender: req.user.id,
    type: "system",
    title: "Tài liệu mới",
    message: `Tài liệu "${title}" vừa được đăng tải.`,
    link: `/documents/detail/${document._id}`,
    relatedModel: "Document",
    relatedId: document._id,
    importance: "medium",
  }));

  await Notification.insertMany(notifications);
  notifications.forEach((notif) => {
    global.io.to(notif.recipient.toString()).emit("newNotification", {
      _id: notif._id,
      title: notif.title,
      message: notif.message,
      link: notif.link,
      createdAt: new Date(),
    });
  });

  res.status(201).json({ success: true, data: document });
});

exports.getDocuments = asyncHandler(async (req, res, next) => {
  const {
    educationLevel,
    grade,
    subject,
    documentType,
    sortBy = "uploadedAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
    dateFrom,
    dateTo,
  } = req.query;

  let query = { status: "published" };
  if (educationLevel) {
    query.educationLevel = educationLevel;
  } else if (req.path.includes("grade1")) {
    query.educationLevel = "primary";
  } else if (req.path.includes("grade2")) {
    query.educationLevel = "secondary";
  } else if (req.path.includes("grade3")) {
    query.educationLevel = "highschool";
  } else if (req.path.includes("university")) {
    query.educationLevel = "university";
  }
  if (grade) query.grade = grade;
  if (subject) query.subject = subject;
  if (documentType) query.documentType = documentType;
  if (dateFrom)
    query.uploadedAt = { ...query.uploadedAt, $gte: new Date(dateFrom) };
  if (dateTo)
    query.uploadedAt = { ...query.uploadedAt, $lte: new Date(dateTo) };

  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const documents = await Document.find(query)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("uploadedBy", "username avatar")
    .select(
      "title description thumbnail educationLevel grade subject documentType downloads views uploadedAt"
    );

  const total = await Document.countDocuments(query);

  res.status(200).json({
    success: true,
    data: documents,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

exports.getDocumentById = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id).populate(
    "uploadedBy",
    "username avatar"
  );
  if (!document || document.status !== "published") {
    return next(
      new ErrorResponse("Tài liệu không tồn tại hoặc chưa được công khai", 404)
    );
  }

  document.views += 1;
  await document.save();

  res.status(200).json({ success: true, data: document });
});

exports.searchDocuments = asyncHandler(async (req, res, next) => {
  const {
    search,
    educationLevel,
    grade,
    subject,
    documentType,
    page = 1,
    limit = 10,
    dateFrom,
    dateTo,
  } = req.query;

  let query = { status: "published" };
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }
  if (educationLevel) query.educationLevel = educationLevel;
  if (grade) query.grade = grade;
  if (subject) query.subject = subject;
  if (documentType) query.documentType = documentType;
  if (dateFrom)
    query.uploadedAt = { ...query.uploadedAt, $gte: new Date(dateFrom) };
  if (dateTo)
    query.uploadedAt = { ...query.uploadedAt, $lte: new Date(dateTo) };

  const documents = await Document.find(query)
    .sort({ uploadedAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("uploadedBy", "username avatar")
    .select(
      "title description thumbnail educationLevel grade subject documentType downloads views uploadedAt"
    );

  const total = await Document.countDocuments(query);

  res.status(200).json({
    success: true,
    data: documents,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page),
  });
});

exports.getPopularDocuments = asyncHandler(async (req, res, next) => {
  const { limit = 4 } = req.query;
  let query = { status: "published" };
  if (req.path.includes("grade1")) {
    query.educationLevel = "primary";
  } else if (req.path.includes("grade2")) {
    query.educationLevel = "secondary";
  } else if (req.path.includes("grade3")) {
    query.educationLevel = "highschool";
  } else if (req.path.includes("university")) {
    query.educationLevel = "university";
  }

  const documents = await Document.find(query)
    .sort({ downloads: -1 })
    .limit(Number(limit))
    .populate("uploadedBy", "username avatar")
    .select("title thumbnail educationLevel documentType downloads views");

  res.status(200).json({ success: true, data: documents });
});

exports.getRelatedDocuments = asyncHandler(async (req, res, next) => {
  const { educationLevel, subject, excludeId } = req.query;
  let query = {
    status: "published",
    _id: { $ne: excludeId },
    educationLevel,
  };
  if (subject) query.subject = subject;

  const documents = await Document.find(query)
    .sort({ views: -1 })
    .limit(4)
    .populate("uploadedBy", "username avatar")
    .select("title thumbnail educationLevel documentType downloads views");

  res.status(200).json({ success: true, data: documents });
});

exports.downloadDocument = asyncHandler(async (req, res, next) => {
  const document = await Document.findById(req.params.id);
  if (!document || document.status !== "published") {
    return next(
      new ErrorResponse("Tài liệu không tồn tại hoặc chưa được công khai", 404)
    );
  }

  document.downloads += 1;
  await document.save();

  res.status(200).json({ success: true, data: { fileUrl: document.fileUrl } });
});
