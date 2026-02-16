const { Server } = require("socket.io");
const gameSocket = require("./game.socket");
const chatSocket = require("./chat.socket");

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on("connection", (socket) => {
    console.log(`✅ Connected: ${socket.id}`);
    gameSocket(io, socket);
    chatSocket(io, socket);
    socket.on("disconnect", () => console.log(`❌ Disconnected: ${socket.id}`));
  });

  return io;
};
module.exports = initializeSocket;
