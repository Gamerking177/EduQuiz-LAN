const Question = require("../question/question.model");
const Game = require("./game.model");
const generateCode = require("../../utils/generateCode");

exports.createGame = async (hostName) => {
  const questions = await Question.find();

  if (!questions.length) {
    throw new Error("No questions available in DB");
  }

  const roomCode = generateCode();

  const game = await Game.create({
    roomCode,
    hostName,
    questions: questions.map(q => q._id),
    status: "waiting",
    currentQuestionIndex: 0
  });

  return game;
};
