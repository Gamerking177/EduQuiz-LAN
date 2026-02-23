const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  questionText: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ["easy", "medium", "hard"], 
    default: "Medium" 
  },
  type: { type: String, enum: ["MCQ", "TRUE_FALSE"], default: "MCQ" },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  timeLimit: { type: Number, default: 0 }
});

module.exports = mongoose.model("Question", questionSchema);
