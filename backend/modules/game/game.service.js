const Game = require("./game.model");
const generateCode = require("../../utils/generateCode");

exports.createGame = async (data) => {
  const roomCode = generateCode();
  return await Game.create({ roomCode, ...data });
};

exports.findGameByCode = async (roomCode) =>
  await Game.findOne({ roomCode });

exports.findGameById = async (id) =>
  await Game.findById(id);
