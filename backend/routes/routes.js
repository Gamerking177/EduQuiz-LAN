const express = require("express");
const router = express.Router();

// 1. Apne Naye Modules import kar (Path check kar lena apne folder ke hisaab se)
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/user/user.route");

// 2. Tere Purane Modules
const gameRoutes = require("../modules/game/game.routes");
const questionRoutes = require("../modules/question/question.routes");
const historyRoutes = require("../modules/history/history.routes");

// 3. Sabko ek sath link (mount) kar de
router.use("/auth", authRoutes);       // Naya: Signup/Login yahan aayega
router.use("/users", userRoutes);      // Naya: Profile update yahan aayega
router.use("/game", gameRoutes);
router.use("/questions", questionRoutes);
router.use("/history", historyRoutes);

module.exports = router;