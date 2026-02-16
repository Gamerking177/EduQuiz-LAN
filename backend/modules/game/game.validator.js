const Joi = require("joi");

const createGameSchema = Joi.object({
  settings: Joi.object({
    title: Joi.string().min(3).max(50).required(),
    category: Joi.string().default("General"),
    timePerQuestion: Joi.number().min(5).max(300).default(15),
    allowLateJoin: Joi.boolean().default(false),
    questionOrder: Joi.string().valid("sequence", "random").default("sequence"),
    restrictToWifi: Joi.boolean().default(false),
    maxPlayers: Joi.number().default(100)
  }).required(),

  questions: Joi.array().items(
    Joi.object({
      questionText: Joi.string().required(),
      type: Joi.string().valid("MCQ", "TRUE_FALSE").default("MCQ"),
      options: Joi.array().items(Joi.string()).min(2).max(6),
      correctAnswer: Joi.string().required(),
      timeLimit: Joi.number().optional(),
      categories: Joi.array().items(Joi.string()).optional()
    })
  ).min(1).required()
});

module.exports = { createGameSchema };
