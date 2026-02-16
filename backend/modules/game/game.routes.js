const express = require("express");
const router = express.Router();

const controller = require("./game.controller");
const validate = require("../../middlewares/validate.middleware");
const { createGameSchema } = require("./game.validator");

router.post("/create",
  validate(createGameSchema),
  controller.createHost
);

router.get("/:roomCode",
  controller.getGameByCode
);

router.get("/:gameId/leaderboard",
  controller.getLeaderboard
);

module.exports = router;
