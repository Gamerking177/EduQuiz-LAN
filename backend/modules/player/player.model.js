const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  name: String,
  score: { type: Number, default: 0 },
  socketId: String,
  roomCode: String,
  answeredQuestions: [{ type: Number }]

});

module.exports = mongoose.model("Player", playerSchema);
