// models/StudyRoom.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const studyRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isPrivate: { type: Boolean, default: false },
  password: { type: String }, // Optional, for private rooms
  topic: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
});

module.exports =  mongoose.model('StudyRoom', studyRoomSchema);