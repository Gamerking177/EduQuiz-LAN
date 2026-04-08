const Game = require("../modules/game/game.model");
const Player = require("../modules/player/player.model");
const Question = require("../modules/question/question.model");

// Anti-Cheat: Options ko shuffle karne ke liye
function shuffleArray(array) {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

module.exports = (io, socket) => {

    // 1. JOIN ROOM
    socket.on("join_room", async ({ name, roomCode, role, deviceId, userId }) => {
        try {
            const game = await Game.findOne({ roomCode, status: { $in: ["waiting", "active"] } });
            if (!game) return socket.emit("error_msg", { message: "Room not found or ended." });

            let clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || "";
            clientIp = clientIp.replace("::ffff:", "").replace("::1", "127.0.0.1");

            // --- HOST ---
            if (role === "host") {
                game.hostSocketId = socket.id;
                game.hostIp = clientIp;
                await game.save();
                socket.join(roomCode);
                const totalQsCount = await Question.countDocuments({ gameId: game._id });
                sendLiveLeaderboard(io, roomCode, game._id, totalQsCount);
                return;
            }

            // --- PLAYER ---
            let existingPlayer = await Player.findOne({ gameId: game._id, deviceId: deviceId });
            if (existingPlayer) {
                existingPlayer.socketId = socket.id;
                await existingPlayer.save();
            } else {
                await Player.create({
                    name, socketId: socket.id, gameId: game._id,
                    userId: userId || null, deviceId: deviceId || "unknown"
                });
            }

            socket.join(roomCode);
            const count = await Player.countDocuments({ gameId: game._id });
            const totalQsCount = await Question.countDocuments({ gameId: game._id });
            
            io.to(roomCode).emit("player_joined", { name, count });
            sendLiveLeaderboard(io, roomCode, game._id, totalQsCount);

            // LATE JOINER (Agar game chal raha hai)
            if (game.status === "active") {
                socket.emit("game_started", { total: totalQsCount });
            }

        } catch (e) { console.error(e); }
    });

    // 2. START GAME (Host dabayega)
    socket.on("start_game", async ({ roomCode }) => {
        try {
            const game = await Game.findOne({ roomCode });
            if (!game) return;

            game.status = "active";
            await game.save();

            // Sabko batao game shuru ho gaya hai
            io.to(roomCode).emit("game_started", { total: 0 });
        } catch (error) { console.error(error); }
    });

    // 3. FETCH EXAM PAPER (Player ka phone maangega)
    // 3. FETCH EXAM PAPER (Backend ka Detective Mode 🕵️‍♂️)
    socket.on("fetch_exam_paper", async ({ roomCode }) => {
        console.log(`📥 Backend: Player ${socket.id} ne paper maanga for room: ${roomCode}`); // Ye backend terminal mein aana chahiye!
        
        try {
            const game = await Game.findOne({ roomCode });
            if (!game) {
                console.log("❌ ERROR: Game hi nahi mili database mein!");
                return;
            }

            const questions = await Question.find({ gameId: game._id });
            console.log(`✅ Backend: Paper mil gaya! Total questions: ${questions.length}`);
            
            // Answer hide karke paper banao (Crash Protection lagayi hai isme)
            const safeQuestions = questions.map((q, index) => {
                const qData = q._doc || q;
                const opts = qData.options || []; // 🟢 CRASH PROTECTION: Agar options null hue toh khali array lega
                
                return {
                    id: qData._id,
                    qIndex: index,
                    questionText: qData.questionText,
                    type: qData.type,
                    options: qData.type === "TRUE_FALSE" ? opts : shuffleArray(opts)
                };
            });

            console.log(`📤 Sending paper directly to player: ${socket.id}`);
            // Sirf maangne wale ko paper do
            socket.emit("start_exam", {
                totalDuration: game?.settings?.totalDuration || 15,
                totalQuestions: safeQuestions.length,
                questions: safeQuestions
            });
            console.log("🚀 Paper successfully dispatched!");

        } catch (error) { 
            console.error("🔥 CRITICAL BACKEND ERROR IN FETCH EXAM:", error); 
        }
    });

    // 4. SUBMIT EXAM (Poora paper ek sath check)
    socket.on("submit_exam", async ({ roomCode, answersMap }) => {
        try {
            const game = await Game.findOne({ roomCode });
            if (!game) return;

            const questions = await Question.find({ gameId: game._id });
            const player = await Player.findOne({ socketId: socket.id });
            if (!player) return;

            let score = 0;
            let detailedResults = [];

            // Examiner Logic
            questions.forEach((dbQuestion) => {
                const questionIdStr = dbQuestion._id.toString();
                const userAnswer = answersMap[questionIdStr] || answersMap[dbQuestion.qIndex]; 
                
                let isCorrect = false;
                if (userAnswer && userAnswer !== "__SKIP__") {
                    isCorrect = (dbQuestion.correctAnswer === userAnswer);
                }
                if (isCorrect) score += 10;

                detailedResults.push({
                    qId: questionIdStr,
                    questionText: dbQuestion.questionText,
                    selectedOption: userAnswer || "Skipped",
                    correctAnswer: dbQuestion.correctAnswer,
                    isCorrect: isCorrect,
                    explanation: dbQuestion.explanation || "" 
                });
            });

            player.score = score;
            player.answerHistory = detailedResults;
            player.answeredQuestions = questions.map((_, i) => i); 
            await player.save();

            socket.emit("game_over", {
                message: "Quiz Completed!",
                finalScore: score,
                correctCount: Math.floor(score / 10),
                totalQuestions: questions.length,
                reportCard: detailedResults
            });

            sendLiveLeaderboard(io, roomCode, game._id, questions.length);

        } catch (error) { console.error(error); }
    });

    // 5. FORCE END GAME
    socket.on("end_quiz_session", async ({ roomCode }) => {
        await Game.findOneAndUpdate({ roomCode }, { status: "ended" });
        io.to(roomCode).emit("game_over", { message: "Host ended the game", isForceEnded: true });
    });

    // 6. DISCONNECT
    socket.on("disconnect", async () => {
        // Basic cleanup
    });
};

// --- SMART LEADERBOARD HELPER ---
async function sendLiveLeaderboard(io, roomCode, gameId, totalQs) {
    const players = await Player.find({ gameId }).select("name score answeredQuestions socketId");
    const room = io.sockets.adapter.rooms.get(roomCode);
    const activeSocketIds = room ? Array.from(room) : [];

    const validPlayers = players.filter(p => activeSocketIds.includes(p.socketId) || p.answeredQuestions.length >= totalQs);
    validPlayers.sort((a, b) => b.score - a.score);

    const leaderboardData = validPlayers.map((p) => ({
        id: p.socketId,
        name: p.name,
        correct: Math.floor(p.score / 10),
        currentQ: p.answeredQuestions.length,
        totalQuestions: totalQs,
        isFinished: p.answeredQuestions.length >= totalQs
    }));

    io.to(roomCode).emit("update_leaderboard", leaderboardData);
}