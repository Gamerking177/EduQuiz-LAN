const express = require("express");
const Question = require("./question.model");

const router = express.Router();

router.post("/", async (req, res) => {
  const question = await Question.create(req.body);
  res.json(question);
});

router.get("/", async (req, res) => {
  const questions = await Question.find();
  res.json(questions);
});

module.exports = router;
