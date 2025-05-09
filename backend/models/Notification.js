// models/Notification.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new mongoose.Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { 
    type: String, 
    enum: ['comment', 'like', 'mention', 'new_post', 'new_exam', 'room_invite', 'grade', 'announcement', 'system'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // URL to redirect when clicked
  relatedModel: { 
    type: String,
    enum: ['Post', 'Comment', 'Exam', 'StudyRoom', 'ExamResult', 'Course', null]
  },
  relatedId: { type: Schema.Types.ObjectId }, // ID of related document
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Optional expiration date
  importance: { 
    type: String, 
    enum: ['low', 'normal', 'high'], 
    default: 'normal' 
  }
});

// Index để tăng tốc độ query thông báo chưa đọc
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports =  mongoose.model('Notification', notificationSchema);