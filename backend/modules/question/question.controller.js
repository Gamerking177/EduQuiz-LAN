const questionService = require("./question.service");
const Game = require("../game/game.model");
const { sendSuccess, sendError } = require("../../utils/response");

exports.addQuestion = async (req, res) => {
  try {
    const question = await questionService.createQuestion(req.body);
    sendSuccess(res, "Question added", question, 201);
  } catch (error) { sendError(res, error.message); }
};

exports.seedBCAQuestions = async (req, res) => {
  try {
    let bankGame = await Game.findOne({ roomCode: "BCA-BANK" });
    if (!bankGame) {
      bankGame = await Game.create({
        roomCode: "BCA-BANK", hostSocketId: "SYSTEM", status: "ended",
        settings: { title: "BCA Master Bank", category: "BCA-Final-Year", totalQuestions: 30 }
      });
    }
    const bcaQuestions = [
      { questionText: "Who is the father of C?", type: "MCQ", options: ["Dennis Ritchie", "James Gosling", "Bjarne Stroustrup", "Guido van Rossum"], correctAnswer: "Dennis Ritchie", categories: ["C", "1st Year"], timeLimit: 20 },
      { questionText: "Which header file is for std I/O in C?", type: "MCQ", options: ["stdio.h", "conio.h", "math.h", "string.h"], correctAnswer: "stdio.h", categories: ["C", "1st Year"], timeLimit: 15 },
      { questionText: "What does SQL stand for?", type: "MCQ", options: ["Structured Query Language", "Simple Query Language", "Standard Query Level", "Sequential Query Language"], correctAnswer: "Structured Query Language", categories: ["DBMS", "2nd Year"], timeLimit: 20 },
      { questionText: "Which key uniquely identifies a record?", type: "MCQ", options: ["Primary Key", "Foreign Key", "Candidate Key", "Super Key"], correctAnswer: "Primary Key", categories: ["DBMS", "2nd Year"], timeLimit: 20 },
      { questionText: "Concept allowing multiple forms of a function?", type: "MCQ", options: ["Polymorphism", "Inheritance", "Encapsulation", "Abstraction"], correctAnswer: "Polymorphism", categories: ["OOPS", "2nd Year"], timeLimit: 25 },
      { questionText: "Wrapping data/methods into one unit is?", type: "MCQ", options: ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"], correctAnswer: "Encapsulation", categories: ["OOPS", "2nd Year"], timeLimit: 20 },
      { questionText: "Is Java platform independent?", type: "TRUE_FALSE", options: ["True", "False"], correctAnswer: "True", categories: ["Java", "3rd Year"], timeLimit: 10 },
      { questionText: "Keyword for variable constant in Java?", type: "MCQ", options: ["final", "const", "static", "fixed"], correctAnswer: "final", categories: ["Java", "3rd Year"], timeLimit: 20 },
      { questionText: "OSI layer for routing?", type: "MCQ", options: ["Network", "Data Link", "Transport", "Physical"], correctAnswer: "Network", categories: ["Networking", "3rd Year"], timeLimit: 25 },
      { questionText: "Round Robin works on Time Quanta.", type: "TRUE_FALSE", options: ["True", "False"], correctAnswer: "True", categories: ["OS", "3rd Year"], timeLimit: 15 }
      // ... more questions can be added here
    ];
    await questionService.deleteManyByFilter({ gameId: bankGame._id });
    const docs = bcaQuestions.map(q => ({ ...q, gameId: bankGame._id }));
    await questionService.insertManyQuestions(docs);
    sendSuccess(res, `BCA Bank seeded with ${docs.length} questions.`, { roomCode: bankGame.roomCode });
  } catch (error) { sendError(res, error.message); }
};
