const Game = require("./game.model");
const generateCode = require("../../utils/generateCode");

// Functions ko const banakar likho
const createGame = async (data) => {
  let roomCode;
  let isUnique = false;

  while (!isUnique) {
    roomCode = generateCode();
    const existingGame = await Game.findOne({ roomCode });
    if (!existingGame) {
      isUnique = true; 
    }
  }

  return await Game.create({ roomCode, ...data });
};

const findGameByCode = async (roomCode) => {
  return await Game.findOne({ roomCode });
};

const findGameById = async (id) => {
  return await Game.findById(id);
};

// 🟢 EK SAATH EXPORT KARO (This is the fix!)
module.exports = {
  createGame,
  findGameByCode,
  findGameById
};