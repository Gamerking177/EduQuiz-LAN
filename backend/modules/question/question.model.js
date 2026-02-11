const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: Number
});

module.exports = mongoose.model("Question", questionSchema);
