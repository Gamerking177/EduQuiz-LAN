const gameService = require("./game.service");

exports.createGame = async (req, res, next) => {
  try {
    const game = await gameService.createGame();
    res.json({ success: true, roomCode: game.roomCode });
  } catch (err) {
    next(err);
  }
};
