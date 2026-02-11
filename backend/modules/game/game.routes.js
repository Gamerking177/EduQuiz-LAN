const express = require("express");
const controller = require("./game.controller");

const router = express.Router();

router.post("/create", controller.createGame);

module.exports = router;
