const questionService = require("./question.service");
const Game = require("../game/game.model");
const generateCode = require("../../utils/generateCode"); // <-- Import Generator
const { sendSuccess, sendError } = require("../../utils/response");

exports.addQuestion = async (req, res) => {
  try {
    const question = await questionService.createQuestion(req.body);
    sendSuccess(res, "Question added", question, 201);
  } catch (error) { sendError(res, error.message); }
};

exports.seedBCAQuestions = async (req, res) => {
  try {
    // 1. Generate a RANDOM Room Code (e.g., A7B2X9)
    const newRoomCode = generateCode();

    // 2. Create a fresh Game entry
    const newGame = await Game.create({
      roomCode: newRoomCode,
      hostSocketId: "SYSTEM",
      status: "waiting", // Set to 'waiting' so you can see it in lobby if needed
      settings: {
        title: "BCA Final Year Exam",
        category: "BCA",
        totalQuestions: 30,
        timePerQuestion: 20,
        questionOrder: "random"
      }
    });

    // 3. Define the Questions
    const bcaQuestions = [

      // ================================
      // 1st YEAR — C PROGRAMMING
      // ================================

      {
        questionText: "Who developed the C language?",
        type: "MCQ",
        options: ["Dennis Ritchie", "James Gosling", "Bjarne Stroustrup", "Guido van Rossum"],
        correctAnswer: "Dennis Ritchie",
        categories: ["C", "1st Year"],
        timeLimit: 30,
        difficulty: "easy"
      },
      {
        questionText: "Which header file is required for printf()?",
        type: "MCQ",
        options: ["stdlib.h", "stdio.h", "math.h", "string.h"],
        correctAnswer: "stdio.h",
        categories: ["C", "1st Year"],
        timeLimit: 30,
        difficulty: "easy"
      },
      {
        questionText: "C is a case-sensitive language.",
        type: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "True",
        categories: ["C", "1st Year"],
        timeLimit: 15,
        difficulty: "easy"
      },
      {
        questionText: "Which loop runs at least once?",
        type: "MCQ",
        options: ["for", "while", "do-while", "foreach"],
        correctAnswer: "do-while",
        categories: ["C", "1st Year"],
        timeLimit: 30,
        difficulty: "medium"
      },
      {
        questionText: "Which symbol is used for pointer declaration?",
        type: "MCQ",
        options: ["&", "*", "#", "%"],
        correctAnswer: "*",
        categories: ["C", "1st Year"],
        timeLimit: 30,
        difficulty: "medium"
      },
      {
        questionText: "Array indexing starts from 0 in C.",
        type: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "True",
        categories: ["C", "1st Year"],
        timeLimit: 15,
        difficulty: "easy"
      },
      {
        questionText: "Which operator is used for modulus?",
        type: "MCQ",
        options: ["%", "/", "*", "&"],
        correctAnswer: "%",
        categories: ["C", "1st Year"],
        timeLimit: 30,
        difficulty: "easy"
      },
      {
        questionText: "sizeof() is an operator in C.",
        type: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "True",
        categories: ["C", "1st Year"],
        timeLimit: 15,
        difficulty: "medium"
      },
      {
        questionText: "Which keyword defines a constant variable?",
        type: "MCQ",
        options: ["constant", "const", "final", "define"],
        correctAnswer: "const",
        categories: ["C", "1st Year"],
        timeLimit: 30,
        difficulty: "medium"
      },
      {
        questionText: "Which data type stores decimal values?",
        type: "MCQ",
        options: ["int", "char", "float", "bool"],
        correctAnswer: "float",
        categories: ["C", "1st Year"],
        timeLimit: 30,
        difficulty: "easy"
      },

      // NEW C QUESTIONS
      {
        questionText: "Which function is used for dynamic memory allocation in C?",
        type: "MCQ",
        options: ["malloc()", "alloc()", "new", "create()"],
        correctAnswer: "malloc()",
        categories: ["C", "1st Year"],
        timeLimit: 60,
        difficulty: "hard"
      },
      {
        questionText: "Pointers store memory addresses.",
        type: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "True",
        categories: ["C", "1st Year"],
        timeLimit: 15,
        difficulty: "easy"
      },

      // ================================
      // DBMS
      // ================================

      {
        questionText: "SQL stands for?",
        type: "MCQ",
        options: ["Structured Query Language", "Sequential Query Language", "Simple Query Language", "Standard Query Level"],
        correctAnswer: "Structured Query Language",
        categories: ["DBMS", "2nd Year"],
        timeLimit: 30,
        difficulty: "easy"
      },
      {
        questionText: "Primary key can contain NULL values.",
        type: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "False",
        categories: ["DBMS", "2nd Year"],
        timeLimit: 15,
        difficulty: "easy"
      },
      {
        questionText: "Which normal form removes transitive dependency?",
        type: "MCQ",
        options: ["1NF", "2NF", "3NF", "BCNF"],
        correctAnswer: "3NF",
        categories: ["DBMS", "2nd Year"],
        timeLimit: 60,
        difficulty: "hard"
      },

      // NEW DBMS
      {
        questionText: "Which SQL command is used to update data?",
        type: "MCQ",
        options: ["UPDATE", "ALTER", "MODIFY", "CHANGE"],
        correctAnswer: "UPDATE",
        categories: ["DBMS", "2nd Year"],
        timeLimit: 30,
        difficulty: "medium"
      },
      {
        questionText: "A table can have multiple primary keys.",
        type: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "False",
        categories: ["DBMS", "2nd Year"],
        timeLimit: 15,
        difficulty: "medium"
      },

      // ================================
      // OOPS
      // ================================

      {
        questionText: "Polymorphism means?",
        type: "MCQ",
        options: ["Many forms", "Single form", "Hidden data", "Data wrapping"],
        correctAnswer: "Many forms",
        categories: ["OOPS", "2nd Year"],
        timeLimit: 30,
        difficulty: "medium"
      },
      {
        questionText: "Encapsulation binds data and functions together.",
        type: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "True",
        categories: ["OOPS", "2nd Year"],
        timeLimit: 15,
        difficulty: "easy"
      },

      // NEW OOPS
      {
        questionText: "Which feature allows reusability of code?",
        type: "MCQ",
        options: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
        correctAnswer: "Inheritance",
        categories: ["OOPS", "2nd Year"],
        timeLimit: 30,
        difficulty: "medium"
      },

      // ================================
      // JAVA
      // ================================

      {
        questionText: "Which method is entry point in Java?",
        type: "MCQ",
        options: ["start()", "init()", "main()", "run()"],
        correctAnswer: "main()",
        categories: ["Java", "3rd Year"],
        timeLimit: 30,
        difficulty: "easy"
      },
      {
        questionText: "Java supports multiple inheritance using interfaces.",
        type: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "True",
        categories: ["Java", "3rd Year"],
        timeLimit: 15,
        difficulty: "medium"
      },

      {
        questionText: "Which keyword is used to create an object in Java?",
        type: "MCQ",
        options: ["make", "new", "create", "init"],
        correctAnswer: "new",
        categories: ["Java", "3rd Year"],
        timeLimit: 30,
        difficulty: "easy"
      },

      // ================================
      // NETWORKING
      // ================================

      {
        questionText: "Which protocol sends email?",
        type: "MCQ",
        options: ["FTP", "SMTP", "HTTP", "SSH"],
        correctAnswer: "SMTP",
        categories: ["Networking", "3rd Year"],
        timeLimit: 30,
        difficulty: "medium"
      },

      {
        questionText: "TCP is connection-oriented.",
        type: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "True",
        categories: ["Networking", "3rd Year"],
        timeLimit: 15,
        difficulty: "medium"
      },

      // ================================
      // OPERATING SYSTEM
      // ================================

      {
        questionText: "Which scheduling uses time quantum?",
        type: "MCQ",
        options: ["FCFS", "SJF", "Round Robin", "Priority"],
        correctAnswer: "Round Robin",
        categories: ["OS", "3rd Year"],
        timeLimit: 60,
        difficulty: "hard"
      },
      {
        questionText: "RAM is volatile memory.",
        type: "TRUE_FALSE",
        options: ["True", "False"],
        correctAnswer: "True",
        categories: ["OS", "3rd Year"],
        timeLimit: 15,
        difficulty: "easy"
      }

    ];


    // 4. Link Questions to the New Game ID
    const docs = bcaQuestions.map(q => ({ ...q, gameId: newGame._id }));
    await questionService.insertManyQuestions(docs);

    // 5. Return the New Code
    sendSuccess(res, `BCA Exam Created! Use Room Code: ${newRoomCode}`, {
      roomCode: newRoomCode,
      gameId: newGame._id,
      totalQuestions: docs.length
    });

  } catch (error) { sendError(res, error.message); }
};