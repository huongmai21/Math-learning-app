const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const LibraryItemController = require("../controllers/LibraryItemController");
const {authenticateToken,checkRole} = require("../middleware/authMiddleware");
// const checkRole = require("../middleware/roleMiddleware");

router.get("/", documentController.getAllDocuments);
router.get("/popular", documentController.getPopularDocuments);
router.get("/search", documentController.searchDocuments);
router.get(
  "/statistics",
  authenticateToken,
  checkRole("admin"),
  documentController.getDocumentStatistics
);
router.get(
  "/report",
  authenticateToken,
  checkRole("admin"),
  documentController.getDocumentReport
);
router.get("/:id", documentController.getDocumentById);

router.post(
  "/create",
  authenticateToken,
  checkRole("admin", "teacher", "student"),
  documentController.createDocument
);

router.put(
  "/update/:id",
  authenticateToken,
  checkRole("admin", "teacher", "student"),
  documentController.updateDocument
);

router.delete(
  "/:id",
  authenticateToken,
  checkRole("admin", "teacher", "student"),
  documentController.deleteDocument
);

router.post("/bookmark", authenticateToken, LibraryItemController.addLibraryItem);

router.delete(
  "/bookmark/:id",
  authenticateToken,
  LibraryItemController.removeLibraryItem
);

router.get(
  "/bookmarks",
  authenticateToken,
  LibraryItemController.getUserLibraryItems
);

router.get(
  "/bookmark/:id",
  authenticateToken,
  LibraryItemController.checkLibraryItem
);

module.exports = router;
