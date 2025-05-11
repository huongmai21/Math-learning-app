const LibraryItem = require("../models/LibraryItem");

exports.addLibraryItem = async (req, res) => {
  try {
    const { referenceId, referenceType } = req.body;

    if (!["post", "document"].includes(referenceType)) {
      return res.status(400).json({
        success: false,
        message: "Loại tài nguyên không hợp lệ!",
      });
    }

    const bookmark = new LibraryItem({
      user: req.user.id,
      referenceType,
      referenceId,
    });

    await bookmark.save();

    res.status(201).json({
      success: true,
      message: "Đã thêm vào danh sách đánh dấu!",
      bookmark,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Tài liệu đã được đánh dấu!",
      });
    }
    res.status(500).json({
      success: false,
      message: "Không thể thêm đánh dấu!",
      error: error.message,
    });
  }
};

exports.removeLibraryItem = async (req, res) => {
  try {
    const bookmark = await LibraryItem.findOneAndDelete({
      user: req.user.id,
      referenceId: req.params.id,
      referenceType: "document",
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh dấu!",
      });
    }

    res.status(200).json({
      success: true,
      message: "Đã xóa đánh dấu!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể xóa đánh dấu!",
      error: error.message,
    });
  }
};

exports.getUserLibraryItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const bookmarks = await LibraryItem.find({
      user: req.user.id,
      referenceType: "document",
    })
      .populate({
        path: "referenceId",
        select:
          "title description thumbnail educationLevel documentType downloads views",
        match: { status: "published" },
      })
      .skip(skip)
      .limit(limit);

    const total = await LibraryItem.countDocuments({
      user: req.user.id,
      referenceType: "document",
    });

    const filteredLibraryItems = bookmarks.filter(
      (bookmark) => bookmark.referenceId
    ); // Loại bỏ bookmark không hợp lệ

    res.status(200).json({
      success: true,
      count: filteredLibraryItems.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      bookmarks: filteredLibraryItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đánh dấu!",
      error: error.message,
    });
  }
};

exports.checkLibraryItem = async (req, res) => {
  try {
    const bookmark = await LibraryItem.findOne({
      user: req.user.id,
      referenceId: req.params.id,
      referenceType: "document",
    });

    res.status(200).json({
      success: true,
      isLibraryItemed: !!bookmark,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Không thể kiểm tra đánh dấu!",
      error: error.message,
    });
  }
};
