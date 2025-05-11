const Document = require("../models/Document");
const LibraryItem = require("../models/LibraryItem");

exports.getAllDocuments = async (req, res) => {
  try {
    const {
      educationLevel,
      grade,
      subject,
      documentType,
      search,
      sortBy = "uploadedAt",
      sortOrder = "desc",
    } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let query = {};
    if (educationLevel) query.educationLevel = educationLevel;
    if (grade) query.grade = grade;
    if (subject) query.subject = subject;
    if (documentType) query.documentType = documentType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }
    query.status = "published";

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const documents = await Document.find(query)
      .select(
        "title description thumbnail educationLevel grade subject documentType downloads views uploadedAt author"
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("author", "username fullName");

    const total = await Document.countDocuments(query);

    res.status(200).json({
      success: true,
      count: documents.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách tài liệu!",
      error: error.message,
    });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Tài liệu không tồn tại!" });
    }
    document.views += 1;
    await document.save();
    res.json({ document });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

exports.getPopularDocuments = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const documents = await Document.find({ status: "published" })
      .select("title thumbnail educationLevel documentType downloads views")
      .sort({ downloads: -1, views: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách tài liệu nổi bật!",
      error: error.message,
    });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const {
      title,
      description,
      fileUrl,
      thumbnail,
      educationLevel,
      grade,
      subject,
      documentType,
      tags,
      content,
      images,
      videoUrl,
    } = req.body;
    if (!title || !fileUrl || !educationLevel || !documentType) {
      return res.status(400).json({ message: "Thiếu các trường bắt buộc!" });
    }
    const document = new Document({
      title,
      description,
      fileUrl,
      thumbnail,
      educationLevel,
      grade,
      subject,
      documentType,
      tags,
      content,
      images,
      videoUrl,
      uploadedBy: req.user.id,
      status: req.user.role === "admin" ? "published" : "draft",
    });
    await document.save();
    res.status(201).json({ message: "Tạo tài liệu thành công!", document });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!" });
  }
};

exports.updateDocument = async (req, res) => {
  try {
    const {
      title,
      description,
      fileUrl,
      thumbnail,
      educationLevel,
      grade,
      subject,
      documentType,
      tags,
      status,
    } = req.body;

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài liệu!",
      });
    }

    if (
      document.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa tài liệu này!",
      });
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        fileUrl,
        thumbnail,
        educationLevel,
        grade: educationLevel !== "university" ? grade : undefined,
        subject: educationLevel === "university" ? subject : "math",
        documentType,
        tags,
        status: req.user.role === "admin" ? status : document.status,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật tài liệu thành công!",
      document: updatedDocument,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cập nhật tài liệu thất bại!",
      error: error.message,
    });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài liệu!",
      });
    }

    if (
      document.author.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa tài liệu này!",
      });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Xóa tài liệu thành công!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Xóa tài liệu thất bại!",
      error: error.message,
    });
  }
};

exports.searchDocuments = async (req, res) => {
  try {
    const { query, educationLevel, documentType, minDownloads, maxDownloads } =
      req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let searchQuery = { status: "published" };
    if (query) {
      searchQuery.$text = { $search: query };
    }
    if (educationLevel) searchQuery.educationLevel = educationLevel;
    if (documentType) searchQuery.documentType = documentType;
    if (minDownloads || maxDownloads) {
      searchQuery.downloads = {};
      if (minDownloads) searchQuery.downloads.$gte = parseInt(minDownloads);
      if (maxDownloads) searchQuery.downloads.$lte = parseInt(maxDownloads);
    }

    const documents = await Document.find(searchQuery)
      .select(
        "title description thumbnail educationLevel documentType downloads views"
      )
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .populate("author", "username fullName");

    const total = await Document.countDocuments(searchQuery);

    res.status(200).json({
      success: true,
      count: documents.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Tìm kiếm tài liệu thất bại!",
      error: error.message,
    });
  }
};

exports.getDocumentStatistics = async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments({
      status: "published",
    });
    const totalDownloads = await Document.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: null, total: { $sum: "$downloads" } } },
    ]);
    const totalViews = await Document.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    const byEducationLevel = await Document.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$educationLevel", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        totalDocuments,
        totalDownloads: totalDownloads[0]?.total || 0,
        totalViews: totalViews[0]?.total || 0,
        byEducationLevel,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy thống kê tài liệu!",
      error: error.message,
    });
  }
};

exports.getDocumentReport = async (req, res) => {
  try {
    const { startDate, endDate, educationLevel, documentType } = req.query;

    let query = { status: "published" };
    if (educationLevel) query.educationLevel = educationLevel;
    if (documentType) query.documentType = documentType;
    if (startDate && endDate) {
      query.uploadedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const report = await Document.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            educationLevel: "$educationLevel",
            documentType: "$documentType",
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$uploadedAt" },
            },
          },
          count: { $sum: 1 },
          totalDownloads: { $sum: "$downloads" },
          totalViews: { $sum: "$views" },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể tạo báo cáo tài liệu!",
      error: error.message,
    });
  }
};
