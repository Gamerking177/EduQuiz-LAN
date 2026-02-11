export default (io, socket) => {
  socket.on('chat_message', ({ room, message }) => {
    io.to(room).emit('chat_message', message);
  });
};
