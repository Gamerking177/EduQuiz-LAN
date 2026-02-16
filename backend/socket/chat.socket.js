module.exports = (io, socket) => {
  socket.on("send_message", ({ roomCode, message, playerName }) => {
    io.to(roomCode).emit("receive_message", {
      message, playerName, timestamp: new Date().toISOString()
    });
  });
};
