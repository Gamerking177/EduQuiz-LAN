import { io } from "socket.io-client";

const SOCKET_URL = "https://eduquiz-lan.onrender.com";

class SocketService {
  socket = null;

  connect() {
    if (!this.socket) {
      console.log("🔌 [Socket] Connecting to server...");

      this.socket = io(SOCKET_URL, {
        // 🟢 FIX 1: Allow polling first, then upgrade to websocket. 
        // Render load balancers like this approach much better for mobile.
        transports: ["polling", "websocket"],
        reconnection: true,
        reconnectionAttempts: 10, // Thoda badha diya for weak mobile data
        reconnectionDelay: 2000,
      });

      this.socket.on("connect", () => {
        console.log("✅ [Socket] Connected! ID:", this.socket.id);
      });

      this.socket.on("connect_error", (err) => {
        // 🟢 Detailed error log for debugging
        console.error("❌ [Socket] Connection Error:", err.message, err.description);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("⚠️ [Socket] Disconnected:", reason);
      });
    }
    return this.socket;
  }

  // Host ke liye room create karna
  createRoom(roomCode, hostName) {
    // 🔥 Backend "join_room" expect karta hai underscore ke sath, aur role: "host"
    this.emit("join_room", { 
        name: hostName, 
        roomCode: roomCode, 
        role: "host" 
    });
  }

  // Player ke liye room join karna
  joinRoom(roomCode, playerName, deviceId) {
    this.emit("join_room", { 
        name: playerName, 
        roomCode: roomCode, 
        role: "player" 
    });
  }

  // 🟢 NAYA: Game start karne ke liye (Underscore wala fix)
  startGame(roomCode) {
    this.emit("start_game", { roomCode }); 
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn(`🚀 [Socket] Cannot emit '${event}', socket not connected.`);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("🔌 [Socket] Cleanly disconnected.");
    }
  }
}

const socketInstance = new SocketService();
export default socketInstance;