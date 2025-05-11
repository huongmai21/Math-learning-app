const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const {authenticateToken} = require('../middleware/authMiddleware');

router.get('/:userId', authenticateToken, notificationController.getNotifications);
router.delete('/:id',authenticateToken, notificationController.deleteNotification);
router.post('/',authenticateToken, notificationController.createNotification);

module.exports = router;