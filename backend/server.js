require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const initializeSocket = require("./socket");

// 1. Connect DB
connectDB();

// 2. Create Server
const server = http.createServer(app);

// 3. Init Socket.io
initializeSocket(server);

// 4. Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
