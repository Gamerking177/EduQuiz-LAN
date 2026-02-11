const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
    roomCode: { type: String, unique: true },
    status: { type: String, default: "waiting" }, // waiting | live | ended
    currentQuestionIndex: { type: Number, default: 0 },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }]
});

module.exports = mongoose.model("Game", gameSchema);
