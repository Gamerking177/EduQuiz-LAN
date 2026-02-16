const express = require("express");
const router = express.Router();
const controller = require("./game.controller");
const validate = require("../../middlewares/validate.middleware");
const { createGameSchema } = require("./game.validator");

// Standard Routes
router.post("/create", validate(createGameSchema), controller.createHost);
router.post("/join", controller.validateJoin); // <-- NEW ROUTE
router.get("/:roomCode", controller.getGameByCode);
router.get("/:gameId/leaderboard", controller.getLeaderboard);

module.exports = router;
