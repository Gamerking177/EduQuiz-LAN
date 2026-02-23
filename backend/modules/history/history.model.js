const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    roomCode: { type: String, required: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    
    // Performance Metrics
    score: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    
    // Format ready for frontend (e.g., "8/10")
    resultFormat: { type: String }, 
    
    playedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("History", HistorySchema);