const Player = require("./player.model");

exports.createPlayer = async (data) =>
  await Player.create(data);

exports.getPlayerBySocket = async (socketId) =>
  await Player.findOne({ socketId });

exports.getPlayersByGame = async (gameId) =>
  await Player.find({ gameId }).sort({ score: -1 });

exports.updateScore = async (playerId, points) =>
  await Player.findByIdAndUpdate(
    playerId,
    { $inc: { score: points } },
    { new: true }
  );
exports.addAnsweredQuestion = async (playerId, questionIndex) =>
  await Player.findByIdAndUpdate(
    playerId,
    { $addToSet: { answeredQuestions: questionIndex } },
    { new: true }
  );
