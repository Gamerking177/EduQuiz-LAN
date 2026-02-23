const Game = require("./game.model");
const generateCode = require("../../utils/generateCode");

exports.createGame = async (data) => {
  let roomCode;
  let isUnique = false;

  // 🔥 NAYA: Jab tak unique code nahi milta, loop chalao
  while (!isUnique) {
    roomCode = generateCode();
    const existingGame = await Game.findOne({ roomCode });
    
    if (!existingGame) {
      isUnique = true; // Unique mil gaya, loop roko!
    }
  }

  // Ab bindass create karo, koi error nahi aayega
  return await Game.create({ roomCode, ...data });
};

exports.findGameByCode = async (roomCode) => {
  return await Game.findOne({ roomCode });
};

exports.findGameById = async (id) => {
  return await Game.findById(id);
};