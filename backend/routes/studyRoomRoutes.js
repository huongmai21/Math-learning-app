// routes/studyRoomRoutes.js
const express = require('express');
const router = express.Router();
const studyRoomController = require('../controllers/studyRoomController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, studyRoomController.createStudyRoom);
router.get('/', studyRoomController.getStudyRooms);
module.exports = router;