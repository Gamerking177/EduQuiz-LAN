const gameService = require("./game.service");
const questionService = require("../question/question.service");
const Player = require("../player/player.model");
const Game = require("./game.model"); // 🔥 FIX 1: Imported Game Model
const Question = require("../question/question.model"); // 🔥 FIX 1: Imported Question Model
const generateCode = require("../../utils/generateCode");
const { sendSuccess, sendError } = require("../../utils/response");

// --- VALIDATE JOIN REQUEST ---
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

    // 4. Check Wi-Fi Security (LAN Feature)
    if (game.settings.restrictToWifi) {
      const hostIp = (game.hostIp || "").replace("::ffff:", "");
      // Assuming local LAN IPs might match up to the 3rd octet (e.g., 192.168.1.X)
      // This strict check is good, but might need tweaking depending on router setup
      if (clientIp !== hostIp && clientIp !== "127.0.0.1") { 
         return sendError(res, "Access Denied: You must be on the same Wi-Fi as the Host.", 403);
      }
    }

    // 5. Success! Return Game Details for Frontend Preview
    sendSuccess(res, "Join Allowed", {
      gameId: game._id,
      title: game.settings.title,
      category: game.settings.category,
      status: game.status,
      hostName: "Host"
    });

  } catch (error) { sendError(res, error.message); }
};

// --- CREATE GAME & QUESTIONS (HOST) ---
exports.createHost = async (req, res) => {
  let newGameId = null; // Track Game ID for rollback

  try {
    const { settings, questions } = req.body;
    
    // IP CLEANING
    let rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    if (rawIp && rawIp.includes("::ffff:")) {
        rawIp = rawIp.replace("::ffff:", "");
    }
    const clientIp = rawIp ? rawIp.split(',')[0].trim() : "unknown";

    // 1. CREATE GAME
    const newGame = await gameService.createGame({
      hostIp: clientIp,
      settings: { ...settings, totalQuestions: questions ? questions.length : 0 }
    });
    
    newGameId = newGame._id; 

    // 2. INSERT QUESTIONS
    if (questions && questions.length > 0) {
      // 🔥 FIX 3: Removed `categories` as per our new Schema
      const docs = questions.map(q => ({
        gameId: newGame._id,
        questionText: q.questionText,
        type: q.type || "MCQ",
        options: q.type === "TRUE_FALSE" ? ["True", "False"] : q.options,
        correctAnswer: q.correctAnswer,
        difficulty: q.difficulty || "medium", // lowercase enum fix
        timeLimit: q.timeLimit || 0
      }));
      
      await questionService.insertManyQuestions(docs);
    }

    sendSuccess(res, "Game created", { roomCode: newGame.roomCode, gameId: newGame._id }, 201);

  } catch (error) {
    // ROLLBACK (UNDO)
    if (newGameId) {
        console.log(`⚠️ Error occurred. Rolling back Game ID: ${newGameId}`);
        await Game.findByIdAndDelete(newGameId); // 🔥 FIX 2: Now Game model is imported
    }
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
      ...player,
      rank: index + 1
    }));

    sendSuccess(res, "Leaderboard fetched", rankedPlayers);
  } catch (error) { 
    sendError(res, error.message); 
  }
};

// --- END GAME (CLEANUP) ---
exports.endGame = async (req, res) => {
  try {
    const { roomCode } = req.body;
    if (!roomCode) return sendError(res, "Room Code is required");

    // Find and Update
    const game = await Game.findOneAndUpdate(
      { roomCode }, 
      { status: "ended" }, 
      { new: true } 
    );

    if (!game) return sendError(res, "Game not found");

    // Optional: Delete questions (Cleanup)
    await Question.deleteMany({ gameId: game._id });

    sendSuccess(res, "Game ended successfully (Database updated)", game);
  } catch (error) {
    sendError(res, error.message);
  }
};