// // socket.js
// const { Server } = require('socket.io');
// const Notification = require('./models/Notification');

// const setupSocket = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: 'http://localhost:3001',
//       methods: ['GET', 'POST'],
//     },
//   });

//   io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);

//     // Tham gia phòng riêng của người dùng
//     socket.on('join', (userId) => {
//       socket.join(userId);
//       console.log(`User ${userId} joined their room`);
//     });

//     // Ngắt kết nối
//     socket.on('disconnect', () => {
//       console.log('User disconnected:', socket.id);
//     });
//   });

//   // Gửi thông báo nhắc nhở
//   const checkReminders = async () => {
//     const now = new Date();
//     const reminderTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 phút sau
//     const notifications = await Notification.find({
//       type: 'new_exam',
//       createdAt: { $lte: reminderTime, $gte: now },
//       isRead: false,
//     });

//     notifications.forEach((notification) => {
//       io.to(notification.recipient.toString()).emit('reminder', {
//         title: notification.title,
//         message: notification.message,
//         link: notification.link,
//       });
//     });
//   };

//   // Kiểm tra mỗi phút
//   setInterval(checkReminders, 60 * 1000);

//   return io;
// };

// module.exports = setupSocket;