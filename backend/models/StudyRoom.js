const mongoose = require("mongoose")
const { Schema } = mongoose

const messageSchema = new mongoose.Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  attachments: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const studyRoomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  isPrivate: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
  }, // Optional, for private rooms
  subject: {
    type: String,
    enum: ["math_primary", "math_secondary", "math_highschool", "math_university", "other"],
    default: "math_highschool",
  },
  topic: {
    type: String,
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  maxMembers: {
    type: Number,
    default: 20,
  },
  status: {
    type: String,
    enum: ["active", "closed", "archived"],
    default: "active",
  },
})

const StudyRoom = mongoose.model("StudyRoom", studyRoomSchema)

module.exports = StudyRoom
