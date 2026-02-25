const Game = require("../modules/game/game.model");
const Player = require("../modules/player/player.model");
const Question = require("../modules/question/question.model");

const activeGames = {}; 

// 🔀 Helper: Array ko mix (shuffle) karne ke liye (ANTI-CHEAT)
function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

module.exports = (io, socket) => {
  
  // 1. JOIN ROOM (Cloud NAT Secured 🛡️)
  socket.on("join_room", async ({ name, roomCode, role }) => {
    try {
      const game = await Game.findOne({ roomCode, status: { $in: ["waiting", "active"] } });
      if (!game) return socket.emit("error_msg", { message: "Room not found or already ended" });

      let clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || "";
      if (typeof clientIp === 'string' && clientIp.includes(',')) {
          clientIp = clientIp.split(',')[0].trim();
      }
      clientIp = clientIp.replace("::ffff:", "").replace("::1", "127.0.0.1");

      if (role === "host") {
        game.hostSocketId = socket.id;
        await game.save();
        socket.join(roomCode);
        console.log(`🔒 Host Joined. Room: ${roomCode}`);
        sendLiveLeaderboard(io, roomCode, game._id);
        return;
      }
      
      if (game.settings.restrictToWifi && clientIp !== game.hostIp && clientIp !== "127.0.0.1") {
          return socket.emit("error_msg", { message: "⚠️ Security: You must be on the Teacher's Wi-Fi network!" });
      }

      let player = await Player.findOne({ gameId: game._id, name: name });
      if (!player) {
          player = await Player.create({ name, socketId: socket.id, gameId: game._id });
      } else {
          player.socketId = socket.id;
          await player.save();
      }

      socket.join(roomCode);
      const count = await Player.countDocuments({ gameId: game._id });
      io.to(roomCode).emit("player_joined", { name, count });
      sendLiveLeaderboard(io, roomCode, game._id);

    } catch(e) { console.error(e); }
  });
  
  // 2. START GAME (ANTI-CHEAT SHUFFLED VERSION 🛡️)
  socket.on("start_game", async ({ roomCode }) => {
    const game = await Game.findOne({ roomCode });
    if (!game) return;
    
    let questions = await Question.find({ gameId: game._id });
    if (!questions || questions.length === 0) {
        return io.to(roomCode).emit("error_msg", { message: "No questions found!" });
    }

    const playerQueues = {}; 
    const playerProgress = {};

    const room = io.sockets.adapter.rooms.get(roomCode);
    const activeSocketIds = room ? Array.from(room) : [];

    activeSocketIds.forEach(socketId => {
        if (socketId !== game.hostSocketId) {
            playerProgress[socketId] = 0;
            const shuffledQ = shuffleArray(questions).map(q => {
                const questionData = q._doc || q;
                return {
                    ...questionData,
                    // 🔥 TRUE_FALSE ko chhod kar baaki options shuffle karo
                    options: questionData.type === "TRUE_FALSE" 
                             ? questionData.options 
                             : shuffleArray(questionData.options)
                };
            });
            playerQueues[socketId] = shuffledQ;
        }
    });

    activeGames[roomCode] = { 
        originalQuestions: questions, 
        settings: game.settings,
        gameId: game._id,
        playerProgress, 
        playerQueues, 
        totalPlayers: await Player.countDocuments({ gameId: game._id })
    };

    game.status = "active";
    await game.save();

    io.to(roomCode).emit("game_started", { total: questions.length });

    setTimeout(() => {
        const state = activeGames[roomCode];
        if (state) {
            for (const socketId in state.playerQueues) {
                const myQuestions = state.playerQueues[socketId];
                if (myQuestions && myQuestions.length > 0) {
                    const q1 = myQuestions[0];
                    io.to(socketId).emit("new_question", { 
                        questionText: q1.questionText,
                        options: q1.options,
                        qIndex: 0,
                        total: myQuestions.length,
                        timeLimit: q1.timeLimit || game.settings.timePerQuestion
                    });
                }
            }
        }
    }, 2000); 
  });

  // 3. SUBMIT ANSWER
  socket.on("submit_answer", async ({ roomCode, answer }) => {
    const state = activeGames[roomCode];
    if (!state || !state.playerQueues[socket.id]) return;

    if (state.playerProgress[socket.id] === undefined) state.playerProgress[socket.id] = 0;

    const currentIdx = state.playerProgress[socket.id];
    const q = state.playerQueues[socket.id][currentIdx]; 
    
    let isCorrect = false;
    if (answer !== "__SKIP__") {
        isCorrect = q.correctAnswer === answer;
    }

    const p = await Player.findOne({ socketId: socket.id });
    if (p) {
        if (isCorrect) p.score += 10;
        p.answeredQuestions.push(currentIdx);
        await p.save();
        
        sendLiveLeaderboard(io, roomCode, state.gameId, state.originalQuestions.length);
    }

    state.playerProgress[socket.id]++; 
    const nextIdx = state.playerProgress[socket.id];

    if (nextIdx < state.playerQueues[socket.id].length) {
        const nextQ = state.playerQueues[socket.id][nextIdx];
        socket.emit("new_question", {
            questionText: nextQ.questionText,
            options: nextQ.options,
            qIndex: nextIdx,
            total: state.playerQueues[socket.id].length,
            timeLimit: nextQ.timeLimit || state.settings.timePerQuestion,
            prevResult: { correct: isCorrect, score: p ? p.score : 0, skipped: answer === "__SKIP__" } 
        });
    } else {
        socket.emit("game_over", { 
            message: "Quiz Completed!", 
            finalScore: p ? p.score : 0
        });
        sendLiveLeaderboard(io, roomCode, state.gameId, state.originalQuestions.length);
    }
  });

  // 4. FORCE END GAME (History Saved ✅)
  socket.on("force_end_game", async ({ roomCode }) => {
     const state = activeGames[roomCode];
     if (state) {
         console.log(`⛔ Host forced end: ${roomCode}`);
         await Game.findByIdAndUpdate(state.gameId, { status: "ended" });
         io.to(roomCode).emit("game_over", { message: "Host ended the game", finalScore: "Check Host Screen" });
         delete activeGames[roomCode];
     }
  });

  // 5. DISCONNECT (Smart Cleanup 🧹 & History Saved ✅)
  socket.on("disconnect", async (reason) => {
      console.log(`🔌 Disconnect: ${socket.id} (Reason: ${reason})`);
      try {
          const player = await Player.findOne({ socketId: socket.id });
          if (player) {
              const game = await Game.findById(player.gameId);
              if (game && game.status === 'waiting') {
                  await Player.findByIdAndDelete(player._id);
                  sendLiveLeaderboard(io, game.roomCode, game._id);
              }
          } else {
              const hostGame = await Game.findOne({ hostSocketId: socket.id });
              if (hostGame && hostGame.status === 'waiting') {
                   console.log(`⚠️ Host disconnected: ${hostGame.roomCode}`);
                   io.to(hostGame.roomCode).emit("lobby_closed", { message: "Host connection lost." });
                   await Game.findByIdAndUpdate(hostGame._id, { status: "cancelled", roomCode: null });
                   // Note: Yahan players ko udana zaruri nahi kyunki game waise bhi cancelled ho gaya
              }
          }
      } catch (error) { console.error("Error in disconnect:", error); }
  });

  // 6. CLEAN LOBBY
  socket.on("clean_lobby", async ({ roomCode }) => {
      const game = await Game.findOne({ roomCode });
      if (game) {
          await Player.deleteMany({ gameId: game._id });
          sendLiveLeaderboard(io, roomCode, game._id);
      }
  });

  // 7. HOST LEAVES LOBBY (DROP GAME - History Saved ✅)
  socket.on("host_leaves_lobby", async ({ roomCode }) => {
      try {
          console.log(`🔥 [Host] Cancelled Room: ${roomCode}`);
          io.to(roomCode).emit("lobby_closed", { message: "Host ended the game session." });
          await Game.findOneAndUpdate({ roomCode }, { status: "cancelled", roomCode: null }); 
          delete activeGames[roomCode]; 
      } catch (error) { console.error(error); }
  });

  // 8. PLAYER CHUP-CHAP LEAVES ROOM
  socket.on("leave_room", async ({ roomCode, playerName }) => { 
      try {
          console.log(`🚶 [Player] ${playerName} left room: ${roomCode}`);
          const game = await Game.findOne({ roomCode });
          if (game) {
              await Player.findOneAndDelete({ gameId: game._id, socketId: socket.id });
              sendLiveLeaderboard(io, roomCode, game._id);
          }
          socket.leave(roomCode); 
      } catch (error) { console.error(error); }
  });
};

// --- SMART LEADERBOARD HELPER ---
async function sendLiveLeaderboard(io, roomCode, gameId, totalQs = 999) {
    const players = await Player.find({ gameId }).select("name score answeredQuestions socketId");
    const room = io.sockets.adapter.rooms.get(roomCode);
    const activeSocketIds = room ? Array.from(room) : [];

    const validPlayers = players.filter(p => {
        const isOnline = activeSocketIds.includes(p.socketId);
        const isFinished = p.answeredQuestions.length >= totalQs;
        return isOnline || isFinished;
    });

    validPlayers.sort((a, b) => b.score - a.score);

    const leaderboardData = validPlayers.map((p, index) => ({
        rank: index + 1,
        name: p.name,
        score: p.score,
        status: p.answeredQuestions.length >= totalQs ? "🏁 Done" : `Q${p.answeredQuestions.length + 1}`
    }));

    io.to(roomCode).emit("update_leaderboard", leaderboardData);
}