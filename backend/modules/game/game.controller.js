const gameService = require("./game.service");
const questionService = require("../question/question.service");
const Player = require("../player/player.model");
const { sendSuccess, sendError } = require("../../utils/response");

exports.createHost = async (req, res) => {
  try {
    const { settings, questions } = req.body;
    const clientIp =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const newGame = await gameService.createGame({
      hostIp: clientIp,
      settings: { ...settings, totalQuestions: questions.length }
    });

    if (questions && questions.length > 0) {
      const docs = questions.map(q => ({
        gameId: newGame._id,
        questionText: q.questionText,
        type: q.type || "MCQ",
        options:
          q.type === "TRUE_FALSE"
            ? ["True", "False"]
            : q.options,
        correctAnswer: q.correctAnswer,
        categories: q.categories || [],
        timeLimit: q.timeLimit || 0
      }));

      await questionService.insertManyQuestions(docs);
    }

    sendSuccess(
      res,
      "Game created",
      { roomCode: newGame.roomCode, gameId: newGame._id },
      201
    );

  } catch (error) {
    sendError(res, error.message);
  }
};

exports.getGameByCode = async (req, res) => {
  try {
    const game = await gameService.findGameByCode(req.params.roomCode);

    if (!game)
      return sendError(res, "Game not found", 404);

    sendSuccess(res, "Game found", game);

  } catch (error) {
    sendError(res, error.message);
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const players = await Player.find({
      gameId: req.params.gameId
    })
      .sort({ score: -1 })
      .limit(50);

    sendSuccess(res, "Leaderboard fetched", players);

  } catch (error) {
    sendError(res, error.message);
  }
};
