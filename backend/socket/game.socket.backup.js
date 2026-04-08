const Game = require("../modules/game/game.model"); // Path adjust kar lena agar alag ho
const Player = require("../modules/player/player.model");
const Question = require("../modules/question/question.model");

// Helper: Array ko mix (shuffle) karne ke liye (ANTI-CHEAT)
function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

module.exports = (io, socket) => {

    // 1. JOIN ROOM (Double Security: IP Check + Name Collision + History)
    socket.on("join_room", async ({ name, roomCode, role, deviceId, userId }) => {
        try {
            const game = await Game.findOne({ roomCode, status: { $in: ["waiting", "active"] } });
            if (!game) return socket.emit("error_msg", { message: "Room not found or already ended." });

            // STRONGER IP CLEANING (Proxy bypass rokne ke liye)
            let clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || "";
            if (typeof clientIp === 'string' && clientIp.includes(',')) {
                clientIp = clientIp.split(',')[0].trim();
            }
            clientIp = clientIp.replace("::ffff:", "").replace("::1", "127.0.0.1");

            // --- HOST LOGIC ---
            if (role === "host") {
                game.hostSocketId = socket.id;
                game.hostIp = clientIp;
                await game.save();
                socket.join(roomCode);
                console.log(`Host Joined. Room: ${roomCode} | IP: ${clientIp}`);

                const totalQsCount = await Question.countDocuments({ gameId: game._id });
                sendLiveLeaderboard(io, roomCode, game._id, totalQsCount);
                return;
            }

            // --- PLAYER LOGIC ---

            // LATE JOIN SECURITY CHECK
            if (game.status === "active") {
                if (!game.settings.allowLateJoin) {
                    return socket.emit("error_msg", { message: "Game has already started. Late joining is not allowed." });
                }
            }

            // Wi-Fi Restrict Check (Gatekeeper)
            if (game.settings.restrictToWifi && clientIp !== game.hostIp && clientIp !== "127.0.0.1") {
                console.log(`Blocked IP: ${clientIp}, Host IP: ${game.hostIp}`);
                return socket.emit("error_msg", {
                    message: "This quiz is restricted to the Host's Wi-Fi network! Please turn off mobile data and connect to the local Wi-Fi."
                });
            }

            // DUPLICATE NAME CHECK (Case-Insensitive via Device ID)
            let existingPlayer = await Player.findOne({ gameId: game._id, deviceId: deviceId });

            if (existingPlayer) {
                existingPlayer.socketId = socket.id;
                await existingPlayer.save();
            } else {
                // Player Create
                await Player.create({
                    name,
                    socketId: socket.id,
                    gameId: game._id,
                    userId: userId || null, 
                    deviceId: deviceId || "unknown"
                });

                // History Update if logged in
                if (userId) {
                    const User = require("../modules/user/user.model");
                    await User.findByIdAndUpdate(userId, {
                        $addToSet: { playedQuizzes: game._id }
                    });
                }
            }

            // Room mein entry aur Leaderboard update
            socket.join(roomCode);
            const totalQsCount = await Question.countDocuments({ gameId: game._id });
            const count = await Player.countDocuments({ gameId: game._id });
            
            io.to(roomCode).emit("player_joined", { name, count });
            sendLiveLeaderboard(io, roomCode, game._id, totalQsCount);

            // 🟢 EXAM MODE: LATE JOIN INJECTION
            // Agar late join allowed hai aur game chal raha hai, toh seedha paper bhej do
            if (game.status === "active") {
                const questions = await Question.find({ gameId: game._id });
                socket.emit("game_started", { total: questions.length });

                const safeQuestions = questions.map((q, index) => {
                    const qData = q._doc || q;
                    return {
                        id: qData._id,
                        qIndex: index,
                        questionText: qData.questionText,
                        type: qData.type,
                        options: qData.type === "TRUE_FALSE" ? qData.options : shuffleArray(qData.options)
                        // 🔴 CHEAT PROTECTION: No correctAnswer here
                    };
                });

                // Send paper directly to the late joiner
                socket.emit("start_exam", {
                    totalDuration: game.settings.totalDuration || 15,
                    totalQuestions: safeQuestions.length,
                    questions: safeQuestions
                });
            }

        } catch (e) { console.error(e); }
    });

    // 2. START GAME (🟢 EXAM MODE + DELAY FIX)
    socket.on("start_game", async ({ roomCode }) => {
        try {
            const game = await Game.findOne({ roomCode });
            if (!game) return;

            let questions = await Question.find({ gameId: game._id });
            if (!questions || questions.length === 0) {
                return io.to(roomCode).emit("error_msg", { message: "No questions found!" });
            }

            game.status = "active";
            await game.save();

            // 1. Sabko batao game shuru ho gaya hai (Isse phone Loading screen pe jayega)
            io.to(roomCode).emit("game_started", { total: questions.length });

            // 🟢 Anti-Cheat: Create safe questions without answers
            const safeQuestions = questions.map((q, index) => {
                const qData = q._doc || q;
                return {
                    id: qData._id,
                    qIndex: index,
                    questionText: qData.questionText,
                    type: qData.type,
                    options: qData.type === "TRUE_FALSE" ? qData.options : shuffleArray(qData.options)
                };
            });

            // 🟢 THE TIMING FIX: 2 Second wait karo taaki frontend ki QuestionPanel screen ready ho jaye
            setTimeout(() => {
                console.log(`📤 Sending paper to room: ${roomCode} now!`); // Ye backend terminal mein aayega
                io.to(roomCode).emit("start_exam", {
                    totalDuration: game?.settings?.totalDuration || 15, // 🟢 Optional chaining (game?.settings)
                    totalQuestions: safeQuestions.length,
                    questions: safeQuestions
                });
            }, 2000);

        } catch (error) { console.error(error); }
    });

    // 3. SUBMIT EXAM (🟢 EK SATH POORA PAPER CHECK KARO - BUG FIXED)
    socket.on("submit_exam", async ({ roomCode, answersMap }) => {
        try {
            const game = await Game.findOne({ roomCode });
            if (!game) return;

            const questions = await Question.find({ gameId: game._id });
            const player = await Player.findOne({ socketId: socket.id });
            if (!player) return;

            let score = 0;
            let detailedResults = [];

            // 👨‍🏫 EXAMINER LOGIC: Paper Check karo by Mongoose ID
            questions.forEach((dbQuestion) => {
                // BUG FIX: ID ko string banakar map se check kiya
                const questionIdStr = dbQuestion._id.toString();
                const userAnswer = answersMap[questionIdStr]; 
                
                let isCorrect = false;

                if (userAnswer && userAnswer !== "__SKIP__") {
                    isCorrect = (dbQuestion.correctAnswer === userAnswer);
                }

                if (isCorrect) score += 10; // 10 Marks per correct answer

                detailedResults.push({
                    qId: questionIdStr,
                    questionText: dbQuestion.questionText,
                    selectedOption: userAnswer || "Skipped",
                    correctAnswer: dbQuestion.correctAnswer,
                    isCorrect: isCorrect,
                    explanation: dbQuestion.explanation || "" 
                });
            });

            // Player data update
            player.score = score;
            player.answerHistory = detailedResults;
            player.answeredQuestions = questions.map((_, i) => i); 
            await player.save();

            // Result send
            socket.emit("game_over", {
                message: "Quiz Completed!",
                finalScore: score,
                correctCount: Math.floor(score / 10),
                totalQuestions: questions.length,
                reportCard: detailedResults
            });

            sendLiveLeaderboard(io, roomCode, game._id, questions.length);

            // Notify Host Dashboard
            if (game.hostSocketId) {
                io.to(game.hostSocketId).emit("player_finished_exam", {
                    playerId: socket.id,
                    name: player.name,
                    score: score,
                    details: detailedResults
                });
            }

        } catch (error) { console.error(error); }
    });

    // 4. FORCE END GAME (Host UI se trigger hoga)
    socket.on("end_quiz_session", async ({ roomCode }) => {
        const game = await Game.findOneAndUpdate({ roomCode }, { status: "ended" });
        if (game) {
            console.log(`Host forced end: ${roomCode}`);
            io.to(roomCode).emit("game_over", {
                message: "Host ended the game",
                isForceEnded: true
            });
        }
    });

    // 5. DISCONNECT (Cleanup)
    socket.on("disconnect", async (reason) => {
        console.log(`Disconnect: ${socket.id} (Reason: ${reason})`);
        try {
            const player = await Player.findOne({ socketId: socket.id });
            if (player) {
                const game = await Game.findById(player.gameId);
                if (game && game.status === 'waiting') {
                    await Player.findByIdAndDelete(player._id);
                    const totalQsCount = await Question.countDocuments({ gameId: game._id });
                    sendLiveLeaderboard(io, game.roomCode, game._id, totalQsCount);
                }
            } else {
                const hostGame = await Game.findOne({ hostSocketId: socket.id });
                if (hostGame && hostGame.status === 'waiting') {
                    io.to(hostGame.roomCode).emit("lobby_closed", { message: "Host connection lost." });
                    await Game.findByIdAndDelete(hostGame._id);
                }
            }
        } catch (error) { console.error(error); }
    });

    // 6. CLEAN LOBBY
    socket.on("clean_lobby", async ({ roomCode }) => {
        const game = await Game.findOne({ roomCode });
        if (game) {
            await Player.deleteMany({ gameId: game._id });
            const totalQsCount = await Question.countDocuments({ gameId: game._id });
            sendLiveLeaderboard(io, roomCode, game._id, totalQsCount);
        }
    });

    // 7. HOST LEAVES LOBBY
    socket.on("host_leaves_lobby", async ({ roomCode }) => {
        try {
            io.to(roomCode).emit("lobby_closed", { message: "Host ended the game session." });
            await Game.findOneAndDelete({ roomCode });
        } catch (error) { console.error(error); }
    });

    // 8. PLAYER CHUP-CHAP LEAVES ROOM
    socket.on("leave_room", async ({ roomCode, playerName }) => {
        try {
            const game = await Game.findOne({ roomCode });
            if (game) {
                await Player.findOneAndDelete({ gameId: game._id, socketId: socket.id });
                const totalQsCount = await Question.countDocuments({ gameId: game._id });
                sendLiveLeaderboard(io, roomCode, game._id, totalQsCount);
            }
            socket.leave(roomCode);
        } catch (error) { console.error(error); }
    });
};

// --- SMART LEADERBOARD HELPER ---
async function sendLiveLeaderboard(io, roomCode, gameId, totalQs) {
    const actualTotalQs = totalQs || 999;
    const players = await Player.find({ gameId }).select("name score answeredQuestions socketId");
    
    const room = io.sockets.adapter.rooms.get(roomCode);
    const activeSocketIds = room ? Array.from(room) : [];

    const validPlayers = players.filter(p => {
        const isOnline = activeSocketIds.includes(p.socketId);
        const isFinished = p.answeredQuestions.length >= actualTotalQs;
        return isOnline || isFinished;
    });

    validPlayers.sort((a, b) => b.score - a.score);

    const uniqueValidPlayers = [];
    const seenNames = new Set();

    for (const p of validPlayers) {
        if (!seenNames.has(p.name)) {
            seenNames.add(p.name);
            uniqueValidPlayers.push(p);
        }
    }

    const leaderboardData = uniqueValidPlayers.map((p) => ({
        id: p.socketId,
        name: p.name,
        correct: Math.floor(p.score / 10),
        currentQ: p.answeredQuestions.length,
        totalQuestions: actualTotalQs,
        isFinished: p.answeredQuestions.length >= actualTotalQs
    }));

    io.to(roomCode).emit("update_leaderboard", leaderboardData);
}