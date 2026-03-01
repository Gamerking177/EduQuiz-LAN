const express = require("express");
const router = express.Router();
const historyController = require("./history.controller");

// Route: GET /api/history/host/:deviceId
router.get("/host/:deviceId", historyController.getHostHistory);

// Route: GET /api/history/player/:deviceId
router.get("/player/:deviceId", historyController.getPlayerHistory);

module.exports = router;