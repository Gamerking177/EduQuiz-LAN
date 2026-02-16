const Game = require("../modules/game/game.model");
const Player = require("../modules/player/player.model");
const Question = require("../modules/question/question.model");

const activeGames = {}; 

module.exports = (io, socket) => {
  
  socket.on("join_room", async ({ name, roomCode, role }) => {
    try {
      const game = await Game.findOne({ roomCode });
      if (!game) return socket.emit("error_msg", { message: "Room not found" });

      if (role === "host") {
        game.hostSocketId = socket.id;
        await game.save();
        socket.join(roomCode);
        return;
      }

      if (game.settings.restrictToWifi) {
        const pIp = (socket.handshake.headers["x-forwarded-for"] || socket.handshake.address).replace("::ffff:", "");
        const hIp = (game.hostIp || "").replace("::ffff:", "");
        if (pIp !== hIp) return socket.emit("error_msg", { message: "Must be on same WiFi" });
      }

      if (game.status === "active" && !game.settings.allowLateJoin) {
        return socket.emit("error_msg", { message: "Game started. No late join." });
      }

      const player = await Player.create({ name, socketId: socket.id, gameId: game._id });
      socket.join(roomCode);
      
      const count = await Player.countDocuments({ gameId: game._id });
      io.to(roomCode).emit("player_joined", { name, playersCount: count });

      // Late Join Sync
      if (game.status === "active" && activeGames[roomCode]) {
        const state = activeGames[roomCode];
        const q = state.questions[state.idx];
        socket.emit("new_question", {
            questionText: q.questionText, options: q.options, type: q.type,
            index: state.idx + 1, total: state.questions.length,
            timeLimit: q.timeLimit || state.settings.timePerQuestion
        });
      }
    } catch (err) { console.error(err); }
  });

  socket.on("start_game", async ({ roomCode }) => {
    const game = await Game.findOne({ roomCode });
    if (!game) return;
    
    let questions = await Question.find({ gameId: game._id });
    if (!questions.length) return;

    if (game.settings.questionOrder === "random") {
        questions = questions.sort(() => Math.random() - 0.5);
    }

    activeGames[roomCode] = {
      idx: 0, questions, settings: game.settings, timer: null
    };

    game.status = "active";
    await game.save();

    io.to(roomCode).emit("game_started", { totalQuestions: questions.length });
    runGameLoop(io, roomCode, game._id);
  });

  socket.on("submit_answer", async ({ roomCode, answer }) => {
    const state = activeGames[roomCode];
    if (!state) return;
    
    const currentQ = state.questions[state.idx];
    const isCorrect = currentQ.correctAnswer === answer;
    
    const player = await Player.findOne({ socketId: socket.id });
    if (player) {
      if (isCorrect) player.score += 10;
      player.answeredQuestions.push(state.idx);
      await player.save();
      socket.emit("answer_result", { correct: isCorrect, score: player.score });
    }
  });

  socket.on("disconnect", async () => {
    const gameAsHost = await Game.findOne({ hostSocketId: socket.id, status: { $ne: "ended" } });
    if (gameAsHost) {
        gameAsHost.status = "ended";
        await gameAsHost.save();
        io.to(gameAsHost.roomCode).emit("error_msg", { message: "Host disconnected" });
        delete activeGames[gameAsHost.roomCode];
    }
  });
};

function runGameLoop(io, roomCode, gameId) {
  const state = activeGames[roomCode];
  if (!state) return;

  if (state.idx >= state.questions.length) {
    finishGame(io, roomCode, gameId);
    return;
  }

  const q = state.questions[state.idx];
  const time = q.timeLimit > 0 ? q.timeLimit : state.settings.timePerQuestion;

  io.to(roomCode).emit("new_question", {
    index: state.idx + 1, total: state.questions.length,
    questionText: q.questionText, type: q.type, options: q.options,
    categories: q.categories, timeLimit: time
  });

  let timeLeft = time;
  if (state.timer) clearInterval(state.timer);
  
  state.timer = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) {
      clearInterval(state.timer);
      handleIntermission(io, roomCode, gameId);
    }
  }, 1000);
}

async function handleIntermission(io, roomCode, gameId) {
    const players = await Player.find({ gameId }).sort({ score: -1 }).limit(5);
    io.to(roomCode).emit("leaderboard", players);
    
    setTimeout(() => {
        if (activeGames[roomCode]) {
            activeGames[roomCode].idx++;
            runGameLoop(io, roomCode, gameId);
        }
    }, 5000);
}

async function finishGame(io, roomCode, gameId) {
    await Game.findByIdAndUpdate(gameId, { status: "ended" });
    const players = await Player.find({ gameId }).sort({ score: -1 });
    io.to(roomCode).emit("game_over", { finalLeaderboard: players });
    delete activeGames[roomCode];
}
