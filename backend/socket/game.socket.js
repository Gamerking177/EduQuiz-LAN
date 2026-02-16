const Game = require("../modules/game/game.model");
const Player = require("../modules/player/player.model");
const Question = require("../modules/question/question.model");

const activeGames = {}; 

module.exports = (io, socket) => {
  
  // 1. JOIN ROOM
  socket.on("join_room", async ({ name, roomCode, role }) => {
    try {
      const game = await Game.findOne({ roomCode });
      if (!game) return socket.emit("error_msg", { message: "Room not found" });

      if (role === "host") {
        game.hostSocketId = socket.id;
        await game.save();
        socket.join(roomCode);
        
        // 🔥 NEW: Send initial leaderboard to Host
        sendLiveLeaderboard(io, roomCode, game._id);
        return;
      }
      
      // Prevent duplicates or handle reconnects
      let player = await Player.findOne({ gameId: game._id, name: name });
      if (!player) {
          player = await Player.create({ name, socketId: socket.id, gameId: game._id });
      } else {
          player.socketId = socket.id;
          await player.save();
      }

      socket.join(roomCode);
      
      // Notify Host
      const count = await Player.countDocuments({ gameId: game._id });
      io.to(roomCode).emit("player_joined", { name, count });
      
      // 🔥 NEW: Update Ranks immediately
      sendLiveLeaderboard(io, roomCode, game._id); 

    } catch(e) { console.error(e); }
  });

  // 2. START GAME
  socket.on("start_game", async ({ roomCode }) => {
    const game = await Game.findOne({ roomCode });
    if (!game) return;
    
    // 🔒 STRICT ISOLATION: Fetch questions ONLY for this gameId
    let questions = await Question.find({ gameId: game._id });
    
    activeGames[roomCode] = { 
        questions, 
        settings: game.settings,
        gameId: game._id,
        playerProgress: {}, 
        totalPlayers: await Player.countDocuments({ gameId: game._id })
    };

    game.status = "active";
    await game.save();

    io.to(roomCode).emit("game_started", { total: questions.length });

    // Send Q1
    const q1 = questions[0];
    io.to(roomCode).emit("new_question", {
        questionText: q1.questionText,
        options: q1.options,
        qIndex: 0,
        total: questions.length,
        timeLimit: q1.timeLimit || game.settings.timePerQuestion
    });
  });

  // 3. SUBMIT ANSWER
  socket.on("submit_answer", async ({ roomCode, answer }) => {
    const state = activeGames[roomCode];
    if (!state) return;

    if (state.playerProgress[socket.id] === undefined) state.playerProgress[socket.id] = 0;

    const currentIdx = state.playerProgress[socket.id];
    const q = state.questions[currentIdx];
    
    // Handle Skip
    let isCorrect = false;
    if (answer !== "__SKIP__") {
        isCorrect = q.correctAnswer === answer;
    }

    const p = await Player.findOne({ socketId: socket.id });
    if (p) {
        if (isCorrect) p.score += 10;
        p.answeredQuestions.push(currentIdx);
        await p.save();
        
        // 🔥 NEW: Update Host Leaderboard Real-Time
        sendLiveLeaderboard(io, roomCode, state.gameId, state.questions.length);
    }

    // Move Next
    state.playerProgress[socket.id]++; 
    const nextIdx = state.playerProgress[socket.id];

    if (nextIdx < state.questions.length) {
        const nextQ = state.questions[nextIdx];
        socket.emit("new_question", {
            questionText: nextQ.questionText,
            options: nextQ.options,
            qIndex: nextIdx,
            total: state.questions.length,
            timeLimit: nextQ.timeLimit || state.settings.timePerQuestion,
            prevResult: { correct: isCorrect, score: p ? p.score : 0, skipped: answer === "__SKIP__" } 
        });
    } else {
        socket.emit("game_over", { 
            message: "Quiz Completed!", 
            finalScore: p ? p.score : 0
        });
        
        // Final Rank Update
        sendLiveLeaderboard(io, roomCode, state.gameId, state.questions.length);
    }
  });

  // 4. FORCE END GAME (NEW)
  socket.on("force_end_game", async ({ roomCode }) => {
     const state = activeGames[roomCode];
     if (state) {
         console.log(`⛔ Host forced end: ${roomCode}`);
         
         await Game.findByIdAndUpdate(state.gameId, { status: "ended" });

         // Notify everyone
         io.to(roomCode).emit("game_over", { 
             message: "Host ended the game", 
             finalScore: "Check Host Screen"
         });

         delete activeGames[roomCode];
     }
  });

  // 5. DISCONNECT
  socket.on("disconnect", async () => {
    console.log(`🔌 Disconnect: ${socket.id}`);
  });
};

// --- HELPER: Send Ranked List ---
async function sendLiveLeaderboard(io, roomCode, gameId, totalQs = 999) {
    const players = await Player.find({ gameId }).select("name score answeredQuestions");
    
    // Sort High to Low
    players.sort((a, b) => b.score - a.score);

    const leaderboardData = players.map((p, index) => ({
        rank: index + 1,
        name: p.name,
        score: p.score,
        status: p.answeredQuestions.length >= totalQs ? "🏁 Done" : `Q${p.answeredQuestions.length + 1}`
    }));

    io.to(roomCode).emit("update_leaderboard", leaderboardData);
}