const express = require("express");
const router = express.Router();

const gameRoutes = require("../modules/game/game.routes");
const questionRoutes = require("../modules/question/question.routes");

router.use("/game", gameRoutes);
router.use("/questions", questionRoutes);

module.exports = router;
