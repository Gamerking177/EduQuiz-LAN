const { Server } = require("socket.io");
const Player = require("../modules/player/player.model");

let io;

exports.initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" }
  });

  io.on("connection", async (socket) => {
    await Player.deleteMany({ socketId: { $exists: true } }); // cleanup old sockets
    require("./game.socket")(io, socket);
  });

};
