const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  socketId: { type: String, required: true },
  
  // 🟢 NAYA: Agar player logged in hai, toh uska User account yahan link hoga
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    default: null // Guest player ke liye null rahega
  },
  
  // 🟢 NAYA: Proxy/fake players rokne ke liye
  deviceId: { type: String, default: "unknown" }, 
  
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true,
    index: true // 🟢 NAYA: Leaderboard query ko 100x fast karne ke liye
  },
  answeredQuestions: [{ type: Number }],
  answerHistory: [
    {
      qIndex: Number,
      questionText: String,
      selectedOption: String,
      isCorrect: Boolean
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Player", playerSchema);