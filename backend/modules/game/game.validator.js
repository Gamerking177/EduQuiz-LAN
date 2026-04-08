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

  // 🟢 NAYA: Exam ke baad reason dikhane ke liye (Optional)
  explanation: Joi.string().allow("").optional(),

  difficulty: Joi.string()
    .valid("easy", "medium", "hard")
    .default("medium")
    
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

    // 🟢 NAYA: timePerQuestion hatakar exam mode wala totalDuration (minutes mein)
    totalDuration: Joi.number()
      .min(1) // Kam se kam 1 minute
      .max(180) // Maximum 3 ghante (180 mins)
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