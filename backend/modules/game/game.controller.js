const gameService = require("./game.service");
const questionService = require("../question/question.service");
const Player = require("../player/player.model");
const Game = require("./game.model");
const Question = require("../question/question.model");
const { sendSuccess, sendError } = require("../../utils/response");

// 🛠️ HELPER FUNCTION: To extract exact IP from Proxy/Cloud
const getRealIp = (req) => {
  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim(); // Proxy list se asli IP nikalo
  }
  return ip.replace("::ffff:", "").replace("::1", "127.0.0.1");
};

// --- VALIDATE JOIN REQUEST ---
// --- ACTUAL JOIN GAME (REST API) ---
exports.validateJoin = async (req, res) => {
  try {
    const { roomCode, playerName, deviceId } = req.body;
    const clientIp = getRealIp(req);
    const userId = req.user ? req.user._id : null; // JWT Middleware se user ID lo

    // 1. Game Check
    const game = await gameService.findGameByCode(roomCode);
    if (!game) return sendError(res, "Invalid Room Code", 404);

    // 2. Status & Wi-Fi Check (Tera purana logic)
    if (game.status === "ended") return sendError(res, "Game has ended", 400);
    if (game.settings.restrictToWifi && clientIp !== game.hostIp && clientIp !== "127.0.0.1") {
      return sendError(res, "Wi-Fi Restriction: Connect to Host's Network", 403);
    }

    // 3. 🟢 DB ENTRY: Player Create Karo (Isse Player DB mein aayega)
    let player = await Player.findOne({ gameId: game._id, deviceId });

    if (!player) {
      player = await Player.create({
        name: playerName,
        gameId: game._id,
        userId: userId, // Account link kar diya
        deviceId: deviceId || "unknown",
        socketId: "pending" // Socket connect hone par update hoga
      });
    }

    // 4. 🟢 USER HISTORY: Played Quizzes update karo
    if (userId) {
      const User = require("../user/user.model");
      await User.findByIdAndUpdate(userId, {
        $addToSet: { playedQuizzes: game._id } // $addToSet se duplicate nahi hoga
      });
    }

    sendSuccess(res, "Joined successfully", {
      gameId: game._id,
      playerId: player._id,
      title: game.settings.title
    });

  } catch (error) { sendError(res, error.message); }
};

// --- CREATE GAME & QUESTIONS (HOST) ---
exports.createHost = async (req, res) => {
  let newGameId = null;

  try {
    const { settings, questions } = req.body;
    const clientIp = getRealIp(req);

    // 🔥 NAYA LOGIC: JWT Token se User ki ID nikal li (Secure way)
    const hostId = req.user._id; // Ya req.user.id (Depend karta hai tere auth middleware pe)

    if (!hostId) {
      return sendError(res, "Unauthorized: Host ID not found in token", 401);
    }

    // 1. CREATE GAME (Saving Host IP AND Host ID)
    const newGame = await gameService.createGame({
      hostId: hostId, // 🟢 Yahan chupke se ID DB ko pass kar di
      hostIp: clientIp,
      settings: { ...settings, totalQuestions: questions ? questions.length : 0 }
    });

    newGameId = newGame._id;

    // 2. INSERT QUESTIONS
    if (questions && questions.length > 0) {
      const docs = questions.map(q => ({
        gameId: newGame._id,
        questionText: q.questionText,
        type: q.type || "MCQ",
        options: q.type === "TRUE_FALSE" ? ["True", "False"] : q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty || "medium",
        explanation: q.explanation || "" // 🟢 Pichla schema update
      }));

      await questionService.insertManyQuestions(docs);
    }

    // 🟢 NAYA: User ke "createdQuizzes" array mein ye game save karna (Dashboard ke liye)
    const User = require("../user/user.model");
    await User.findByIdAndUpdate(hostId, {
      $push: { createdQuizzes: newGame._id }
    });

    sendSuccess(res, "Game created", { roomCode: newGame.roomCode, gameId: newGame._id }, 201);

  } catch (error) {
    if (newGameId) await Game.findByIdAndDelete(newGameId);
    sendError(res, error.message, 500);
  }
};

// --- GET GAME BY CODE ---
exports.getGameByCode = async (req, res) => {
  try {
    const game = await gameService.findGameByCode(req.params.roomCode);
    if (!game) return sendError(res, "Game not found", 404);
    sendSuccess(res, "Game found", game);
  } catch (error) { sendError(res, error.message); }
};

// --- GET FINAL LEADERBOARD ---
exports.getLeaderboard = async (req, res) => {
  try {
    const players = await Player.find({ gameId: req.params.gameId })
      .sort({ score: -1 })
      .lean();

    const rankedPlayers = players.map((player, index) => ({
      ...player, rank: index + 1
    }));

    sendSuccess(res, "Leaderboard fetched", rankedPlayers);
  } catch (error) { sendError(res, error.message); }
};

// --- END GAME (CLEANUP) ---
exports.endGame = async (req, res) => {
  try {
    const { roomCode } = req.body;
    if (!roomCode) return sendError(res, "Room Code is required");

    const game = await Game.findOneAndUpdate(
      { roomCode }, { status: "ended" }, { new: true }
    );
    if (!game) return sendError(res, "Game not found");

    await Question.deleteMany({ gameId: game._id });
    sendSuccess(res, "Game ended successfully", game);
  } catch (error) { sendError(res, error.message); }
};