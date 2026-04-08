const express = require("express");
const router = express.Router();
const controller = require("./game.controller");
const validate = require("../../middlewares/validate.middleware");
const { createGameSchema } = require("./game.validator");

// 🟢 NAYA: Auth middleware import kiya
const { protect } = require("../../middlewares/auth.middleware"); 

// Standard Routes (Create par protect laga diya)
router.post("/create", protect, validate(createGameSchema), controller.createHost);
router.post("/join", protect, controller.validateJoin); 
router.get("/:roomCode", controller.getGameByCode);
router.get("/:gameId/leaderboard", controller.getLeaderboard);
router.post("/end", controller.endGame);

module.exports = router;