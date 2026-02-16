const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const mainRoutes = require("./routes/routes");
const errorHandler = require("./middlewares/error.middleware");
const { sendError } = require("./utils/response");

const app = express();

// Middlewares
app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// default route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the EduQuiz LAN Backend API"
  },);
});

// Routes
app.use("/api", mainRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// 404
app.use((req, res, next) => {
  sendError(res, `Route not found: ${req.originalUrl}`, 404);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
