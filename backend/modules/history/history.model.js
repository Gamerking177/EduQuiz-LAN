const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  originalGameId: { type: String }, // Reference ke liye
  roomCode: { type: String },
  hostDeviceId: { type: String, required: true },
  settings: {
    title: String,
    category: String,
    timePerQuestion: Number,
    totalQuestions: Number
  },
  status: { type: String, enum: ["ended", "cancelled"], required: true },
  
  // 🟢 NAYA: Saare players ka result ek hi array mein (No relational joins needed later!)
  players: [
    {
      name: String,
      deviceId: String,
      score: Number,
      rank: Number,
      answerHistory: [
        {
          qIndex: Number,
          questionText: String,
          selectedOption: String,
          isCorrect: Boolean
        }
      ]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("History", historySchema);