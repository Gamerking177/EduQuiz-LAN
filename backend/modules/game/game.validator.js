const Joi = require("joi");

const questionSchema = Joi.object({
  questionText: Joi.string().min(5).max(500).required(),

  type: Joi.string()
    .valid("MCQ", "TRUE_FALSE")
    .default("MCQ"),

  options: Joi.when("type", {
    is: "TRUE_FALSE",
    then: Joi.array()
      .items(Joi.string().valid("True", "False"))
      .length(2)
      .default(["True", "False"]),
    otherwise: Joi.array()
      .items(Joi.string().min(1))
      .min(2)
      .max(6)
      .required()
  }),

  correctAnswer: Joi.string().required(),

  timeLimit: Joi.number()
    .valid(15, 30, 60)
    .default(30),

  difficulty: Joi.string()
    .valid("easy", "medium", "hard")
    .default("medium")
    
  // 🔥 categories block removed to match Mongoose schema!

}).custom((value, helpers) => {
  if (value.type === "MCQ") {
    if (!value.options.includes(value.correctAnswer)) {
      return helpers.message("Correct answer must be one of the provided options");
    }
  }
  return value;
});

const createGameSchema = Joi.object({
  settings: Joi.object({
    title: Joi.string().min(3).max(50).required(),
    category: Joi.string().default("General"),

    timePerQuestion: Joi.number()
      .valid(15, 30, 60)
      .default(30),

    allowLateJoin: Joi.boolean().default(false),

    questionOrder: Joi.string()
      .valid("sequence", "random")
      .default("sequence"),

    restrictToWifi: Joi.boolean().default(false),

    maxPlayers: Joi.number()
      .min(1)
      .max(500)
      .default(100)

  }).required(),

  questions: Joi.array()
    .items(questionSchema)
    .min(1)
    .max(200)
    .required()

}).options({ abortEarly: false });

module.exports = { createGameSchema };