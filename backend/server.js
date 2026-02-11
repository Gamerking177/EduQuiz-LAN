import http from 'http';
import app from './app.js';
import { initSocket } from './socket/index.js';

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('🚀 Server running on port', PORT);
});
