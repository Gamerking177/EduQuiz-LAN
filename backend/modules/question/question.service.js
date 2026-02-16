const Question = require("./question.model");

exports.createQuestion = async (data) => await Question.create(data);
exports.insertManyQuestions = async (data) => await Question.insertMany(data);
exports.getQuestionsByGame = async (gameId) => await Question.find({ gameId });
exports.deleteManyByFilter = async (filter) => await Question.deleteMany(filter);
