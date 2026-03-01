const express = require("express");
const router = express.Router();

const gameRoutes = require("../modules/game/game.routes");
const questionRoutes = require("../modules/question/question.routes");
const historyRoutes = require("../modules/history/history.routes");

router.use("/game", gameRoutes);
router.use("/questions", questionRoutes);
router.use("/history", historyRoutes);

module.exports = router;
