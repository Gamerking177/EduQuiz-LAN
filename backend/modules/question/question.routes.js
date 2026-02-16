const express = require("express");
const router = express.Router();
const controller = require("./question.controller");

router.post("/add", controller.addQuestion);
router.post("/seed-bca", controller.seedBCAQuestions);

module.exports = router;
