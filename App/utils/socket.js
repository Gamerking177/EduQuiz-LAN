import { io } from "socket.io-client";

const SOCKET_URL = "https://eduquiz-lan.onrender.com";

class SocketService {
  socket = null;

  connect() {
    if (!this.socket) {
      console.log("🔌 [Socket] Connecting to server...");

      this.socket = io(SOCKET_URL, {
        // 🟢 FIX 1: Allow polling first, then upgrade to websocket. 
        transports: ["polling", "websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      this.socket.on("connect", () => {
        console.log("✅ [Socket] Connected! ID:", this.socket.id);
      });

      this.socket.on("connect_error", (err) => {
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

  // Game start karne ke liye
  startGame(roomCode) {
    this.emit("start_game", { roomCode }); 
  }

  // 🟢 NAYA: Player jab answer submit karega
  submitAnswer(roomCode, answer) {
    this.emit("submit_answer", { roomCode, answer });
  }

  // 🟢 NAYA: Host jab lobby close karega (Drop Game)
  closeLobby(roomCode) {
    this.emit("host_leaves_lobby", { roomCode });
  }

  // 🟢 NAYA: Player jab chup-chap room chhodega (Underscore fix ke sath)
  leaveRoom(roomCode, playerName) {
    this.emit("leave_room", { roomCode, playerName }); // 👈 Yahan leave_room kar diya
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