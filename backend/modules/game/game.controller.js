const gameService = require("./game.service");
const questionService = require("../question/question.service");
const Player = require("../player/player.model");
const generateCode = require("../../utils/generateCode");
const { sendSuccess, sendError } = require("../../utils/response");

// --- NEW: VALIDATE JOIN REQUEST ---
exports.validateJoin = async (req, res) => {
  try {
    const { roomCode, playerName } = req.body;
    const clientIp = (req.headers["x-forwarded-for"] || req.socket.remoteAddress).replace("::ffff:", "");

    // 1. Find Game
    const game = await gameService.findGameByCode(roomCode);
    if (!game) return sendError(res, "Invalid Room Code", 404);

    // 2. Check Game Status
    if (game.status === "ended") return sendError(res, "Game has ended", 400);
    if (game.status === "active" && !game.settings.allowLateJoin) {
      return sendError(res, "Game already started. Late join disabled.", 403);
    }

    // 3. Check Max Players
    const playerCount = await Player.countDocuments({ gameId: game._id });
    if (playerCount >= game.settings.maxPlayers) {
      return sendError(res, "Room is full", 403);
    }

    // 4. Check Wi-Fi Security
    if (game.settings.restrictToWifi) {
      const hostIp = (game.hostIp || "").replace("::ffff:", "");
      if (clientIp !== hostIp) {
         return sendError(res, "Access Denied: You must be on the same Wi-Fi as the Host.", 403);
      }
    }

    // 5. Success! Return Game Details for Frontend Preview
    sendSuccess(res, "Join Allowed", {
      gameId: game._id,
      title: game.settings.title,
      category: game.settings.category,
      status: game.status,
      hostName: "Host" // You can enhance this if you store Host Name
    });

  } catch (error) { sendError(res, error.message); }
};

exports.createHost = async (req, res) => {
  try {
    const { settings, questions } = req.body;
    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    
    // Auto-calculate total questions
    const newGame = await gameService.createGame({
      hostIp: clientIp,
      settings: { ...settings, totalQuestions: questions.length }
    });

    if (questions && questions.length > 0) {
      const docs = questions.map(q => ({
        gameId: newGame._id,
        questionText: q.questionText,
        type: q.type || "MCQ",
        options: q.type === "TRUE_FALSE" ? ["True", "False"] : q.options,
        correctAnswer: q.correctAnswer,
        categories: q.categories || [],
        timeLimit: q.timeLimit || 0
      }));
      await questionService.insertManyQuestions(docs);
    }
    sendSuccess(res, "Game created", { roomCode: newGame.roomCode, gameId: newGame._id }, 201);
  } catch (error) { sendError(res, error.message); }
};

exports.getGameByCode = async (req, res) => {
  try {
    const game = await gameService.findGameByCode(req.params.roomCode);
    if (!game) return sendError(res, "Game not found", 404);
    sendSuccess(res, "Game found", game);
  } catch (error) { sendError(res, error.message); }
};

exports.getLeaderboard = async (req, res) => {
  try {
    // 1. Get players sorted by Score (High -> Low)
    // .lean() converts Mongoose documents to plain JSON objects so we can edit them
    const players = await Player.find({ gameId: req.params.gameId })
      .sort({ score: -1 })
      .lean(); 

    // 2. Add "rank" field to each player
    const rankedPlayers = players.map((player, index) => ({
      ...player,
      rank: index + 1 // Rank is Index + 1 (Index 0 = Rank 1)
    }));

    sendSuccess(res, "Leaderboard fetched", rankedPlayers);
  } catch (error) { 
    sendError(res, error.message); 
  }
};
