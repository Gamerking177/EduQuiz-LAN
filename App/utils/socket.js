import { io } from "socket.io-client";

const SOCKET_URL = "https://eduquiz-lan.onrender.com";

class SocketService {
  socket = null;

  connect() {
    if (!this.socket) {
      console.log("🔌 [Socket] Connecting to server...");

      this.socket = io(SOCKET_URL, {
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

  // 🟢 FIX 1: Host ke liye room create karna (deviceId add kiya)
  createRoom(roomCode, hostName, deviceId) {
    this.emit("join_room", { 
        name: hostName, 
        roomCode: roomCode, 
        role: "host",
        deviceId: deviceId || "unknown_host" // Backend check ke liye
    });
  }

  // 🟢 FIX 2: Player ke liye room join karna (deviceId add kiya)
  joinRoom(roomCode, playerName, deviceId) {
    this.emit("join_room", { 
        name: playerName, 
        roomCode: roomCode, 
        role: "player",
        deviceId: deviceId || "unknown_player" // Backend duplicate name check ke liye
    });
  }

  startGame(roomCode) {
    this.emit("start_game", { roomCode }); 
  }

  // 🟢 EXAM MODE SUBMIT (Ye add karna zaroori hai)
  submitExam(roomCode, answersMap) {
    this.emit("submit_exam", { roomCode, answersMap });
  }

  submitAnswer(roomCode, answer) {
    this.emit("submit_answer", { roomCode, answer });
  }

  closeLobby(roomCode) {
    this.emit("host_leaves_lobby", { roomCode });
  }

  leaveRoom(roomCode, playerName) {
    this.emit("leave_room", { roomCode, playerName });
  }

  // 🟢 NAYA FIX 3: Host jab running quiz ko jabardasti stop karega
  endQuizSession(roomCode) {
    this.emit("end_quiz_session", { roomCode });
  }

  // 🟢 NAYA FIX: Screen load hone par paper mangne ke liye
  fetchExamPaper(roomCode) {
    this.emit("fetch_exam_paper", { roomCode });
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