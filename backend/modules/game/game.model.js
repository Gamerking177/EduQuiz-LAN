const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  
  // 🟢 NAYA: Jis user ne quiz banaya hai, uska account link karna zaroori hai
  hostId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
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
    
    // 🟢 NAYA: timePerQuestion hatakar exam wali feel ke liye totalDuration (minutes mein)
    totalDuration: { type: Number, default: 30 }, 
    
    allowLateJoin: { type: Boolean, default: false },
    questionOrder: { type: String, enum: ["sequence", "random"], default: "sequence" },
    restrictToWifi: { type: Boolean, default: false },
    maxPlayers: { type: Number, default: 100 }
  }
}, { timestamps: true });

module.exports = mongoose.model("Game", gameSchema);