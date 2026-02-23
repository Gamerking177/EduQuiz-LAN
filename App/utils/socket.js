import { io } from "socket.io-client";

// Backend URL from your deployment
const SOCKET_URL = "https://eduquiz-lan.onrender.com";

class SocketService {
  socket = null;

  connect() {
    if (!this.socket) {
      console.log("🔌 [Socket] Connecting to server...");
      
      this.socket = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      this.socket.on("connect", () => {
        console.log("✅ [Socket] Connected! ID:", this.socket.id);
      });

      this.socket.on("connect_error", (err) => {
        console.error("❌ [Socket] Connection Error:", err.message);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("⚠️ [Socket] Disconnected:", reason);
      });
    }
    return this.socket;
  }

  // 🟢 Specific Emitters (Clean approach)
  
  // Host ke liye room create karna
  createRoom(roomCode, hostName) {
    this.emit("create-room", { roomCode, hostName });
  }

  // Player ke liye room join karna
  joinRoom(roomCode, playerName, deviceId) {
    this.emit("join-room", { roomCode, playerName, deviceId });
  }

  // Generic methods
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