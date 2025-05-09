// controllers/studyRoomController.js
const StudyRoom = require('../models/StudyRoom');

exports.createStudyRoom = async (req, res) => {
  const { title } = req.body;
  try {
    const room = new StudyRoom({
      title,
      UsersID: [req.user.id],
      created_at: new Date(),
      status: 'active',
    });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo phòng', error: err.message });
  }
};

exports.getStudyRooms = async (req, res) => {
  try {
    const rooms = await StudyRoom.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách phòng', error: err.message });
  }
};