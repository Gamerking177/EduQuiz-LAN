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
  answeredQuestions: [{ type: Number }]
}, { timestamps: true });

module.exports = mongoose.model("Player", playerSchema);
