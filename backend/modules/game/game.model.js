const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  hostSocketId: { type: String },
  hostIp: { type: String },
  allowedIp: {
    type: [String],
    default: [],
  },
  status: { type: String, enum: ["waiting", "active", "ended"], default: "waiting" },
  settings: {
    title: { type: String, required: true },
    category: { type: String, default: "General" },
    totalQuestions: { type: Number, default: 0 },
    timePerQuestion: { type: Number, default: 15 },
    allowLateJoin: { type: Boolean, default: false },
    questionOrder: { type: String, enum: ["sequence", "random"], default: "sequence" },
    restrictToWifi: { type: Boolean, default: false },
    maxPlayers: { type: Number, default: 100 }
  }

}, { timestamps: true });

module.exports = mongoose.model("Game", gameSchema);
