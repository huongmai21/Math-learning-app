const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const multer = require('multer');

// Cấu hình multer để xử lý file upload
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe); 
router.put('/avatar', authenticateToken, upload.single('avatar'), authController.updateAvatar);

module.exports = router;