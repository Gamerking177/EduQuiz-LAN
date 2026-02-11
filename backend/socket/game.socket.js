const Game = require("../modules/game/game.model");
const Player = require("../modules/player/player.model");

module.exports = (io, socket) => {

  const log = (event, data = "") => {
    console.log(`[SOCKET] ${event}`, data);
  };


  socket.on("join_room", async ({ name, roomCode }) => {
    const game = await Game.findOne({ roomCode });
    if (!game) return;

    const player = await Player.create({ name, roomCode, socketId: socket.id });

    if (!game.players.includes(player._id)) {
      game.players.push(player._id);
      await game.save();
    }

    socket.join(roomCode);
    io.to(roomCode).emit("player_joined", name);
  });

  socket.on("start_game", async (roomCode) => {
    const game = await Game.findOne({ roomCode }).populate("questions");
    game.status = "live";
    await game.save();

    io.to(roomCode).emit("game_started", game.questions[0]);
  });

  socket.on("submit_answer", async ({ roomCode, answerIndex }) => {
    const player = await Player.findOne({ socketId: socket.id });
    const game = await Game.findOne({ roomCode }).populate("questions");

    if (!player || !game) return;

    const qIndex = game.currentQuestionIndex;

    if (player.answeredQuestions.includes(qIndex)) return;

    const correct = game.questions[qIndex].correctAnswer === answerIndex;
    if (correct) player.score += 10;

    player.answeredQuestions.push(qIndex);
    await player.save();
  });


  socket.on("next_question", async (roomCode) => {
    const game = await Game.findOne({ roomCode }).populate("questions");
    if (!game) return;

    if (game.status !== "live") return;

    game.currentQuestionIndex += 1;

    if (game.currentQuestionIndex >= game.questions.length) {
      game.status = "ended";
      await game.save();

      const players = await Player.find({ roomCode }).sort({ score: -1 });
      io.to(roomCode).emit("game_over", players);
      return;
    }

    await game.save();
    io.to(roomCode).emit("next_question", game.questions[game.currentQuestionIndex]);
  });


  socket.on("disconnect", async () => {
    const player = await Player.findOne({ socketId: socket.id });
    if (!player) return;

    const game = await Game.findOne({ roomCode: player.roomCode });
    if (game) {
      game.players = game.players.filter(
        id => id.toString() !== player._id.toString()
      );
      await game.save();
    }

    io.to(player.roomCode).emit("player_left", player.name);
    await player.deleteOne();
  });

};
