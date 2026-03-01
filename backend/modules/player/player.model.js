const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  socketId: { type: String, required: true },
  score: { type: Number, default: 0 },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true
  },
  answeredQuestions: [{ type: Number }],
  // 🟢 NAYA LOGIC: Player ki history save karne ke liye
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
