const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  gameId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Game", 
    required: true,
    index: true 
  },
  questionText: { 
    type: String, 
    required: true,
    trim: true
  },
  difficulty: { 
    type: String, 
    enum: ["easy", "medium", "hard"], 
    default: "medium" 
  },
  type: { 
    type: String, 
    enum: ["MCQ", "TRUE_FALSE"], 
    default: "MCQ" 
  },
  options: [{ 
    type: String,
    required: true 
  }],
  correctAnswer: { 
    type: String, 
    required: true 
  },
  explanation: { 
    type: String, 
    default: "" 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("Question", questionSchema);